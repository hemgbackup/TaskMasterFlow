import * as WhatsApp from 'whatsapp-web.js';
import QRCode from 'qrcode';
import { storage } from './storage';

const { Client, LocalAuth } = WhatsApp;

class WhatsAppService {
  private client: any = null;
  private qrCode: string | null = null;
  private isReady: boolean = false;
  private currentUserId: number | null = null;

  constructor() {
    // Initialize client only when needed to avoid immediate startup
  }

  private initializeClient() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: './whatsapp-sessions',
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.client) return;

    this.client.on('qr', async (qr) => {
      console.log('QR Code gerado para WhatsApp');
      try {
        this.qrCode = await QRCode.toDataURL(qr);
        
        // Update database with QR code if user is set
        if (this.currentUserId) {
          await storage.updateWhatsappConnection(this.currentUserId, {
            qrCode: this.qrCode,
            isConnected: false,
          });
        }
      } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
      }
    });

    this.client.on('ready', async () => {
      console.log('WhatsApp Client está pronto!');
      this.isReady = true;
      this.qrCode = null;

      // Update database with connection status
      if (this.currentUserId) {
        const clientInfo = this.client?.info;
        await storage.updateWhatsappConnection(this.currentUserId, {
          isConnected: true,
          phoneNumber: clientInfo?.wid?.user || null,
          lastConnected: new Date(),
          qrCode: null,
        });
      }
    });

    this.client.on('authenticated', () => {
      console.log('WhatsApp autenticado com sucesso');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('Falha na autenticação do WhatsApp:', msg);
    });

    this.client.on('disconnected', async (reason) => {
      console.log('WhatsApp desconectado:', reason);
      this.isReady = false;
      
      // Update database with disconnection
      if (this.currentUserId) {
        await storage.updateWhatsappConnection(this.currentUserId, {
          isConnected: false,
          qrCode: null,
        });
      }
    });

    this.client.on('message', async (message: any) => {
      try {
        // Only process messages that are not from status broadcast
        if (message.from === 'status@broadcast') return;

        // Get contact info
        const contact = await message.getContact();
        const chat = await message.getChat();

        // Skip group messages for now
        if (chat.isGroup) return;

        // Detect priority based on keywords
        const content = message.body.toLowerCase();
        let priority = 'media';
        
        if (content.includes('urgente') || content.includes('emergência') || content.includes('prioridade alta')) {
          priority = 'alta';
        } else if (content.includes('importante') || content.includes('prioritário')) {
          priority = 'alta';
        } else if (content.includes('quando possível') || content.includes('sem pressa')) {
          priority = 'baixa';
        }

        // Save message to database if user is connected
        if (this.currentUserId) {
          await storage.createWhatsappMessage({
            userId: this.currentUserId,
            contact: contact.name || contact.number,
            content: message.body,
            time: new Date().toISOString(),
            priority,
            converted: false,
          });

          // Create notification for new message
          await storage.createNotification({
            userId: this.currentUserId,
            title: 'Nova Mensagem WhatsApp',
            message: `Mensagem de ${contact.name || contact.number}: ${message.body.substring(0, 50)}${message.body.length > 50 ? '...' : ''}`,
            type: 'info',
          });
        }

        console.log(`Nova mensagem de ${contact.name || contact.number}: ${message.body}`);
      } catch (error) {
        console.error('Erro ao processar mensagem do WhatsApp:', error);
      }
    });
  }

  async startConnection(userId: number): Promise<{ success: boolean; qrCode?: string; message: string }> {
    try {
      this.currentUserId = userId;

      if (this.isReady) {
        return {
          success: true,
          message: 'WhatsApp já está conectado'
        };
      }

      if (!this.client) {
        this.initializeClient();
      }

      // Start the client
      await this.client!.initialize();

      // Wait for QR code or ready state
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve({
            success: false,
            message: 'Timeout ao tentar conectar com WhatsApp'
          });
        }, 30000); // 30 seconds timeout

        const checkStatus = () => {
          if (this.isReady) {
            clearTimeout(timeout);
            resolve({
              success: true,
              message: 'WhatsApp conectado com sucesso'
            });
          } else if (this.qrCode) {
            clearTimeout(timeout);
            resolve({
              success: true,
              qrCode: this.qrCode,
              message: 'QR Code gerado. Escaneie para conectar.'
            });
          } else {
            setTimeout(checkStatus, 1000);
          }
        };

        checkStatus();
      });
    } catch (error) {
      console.error('Erro ao iniciar conexão WhatsApp:', error);
      return {
        success: false,
        message: 'Erro ao iniciar conexão com WhatsApp'
      };
    }
  }

  async disconnect(userId: number): Promise<{ success: boolean; message: string }> {
    try {
      if (this.client) {
        await this.client.destroy();
        this.client = null;
        this.isReady = false;
        this.qrCode = null;
        this.currentUserId = null;

        // Update database
        await storage.updateWhatsappConnection(userId, {
          isConnected: false,
          qrCode: null,
        });

        return {
          success: true,
          message: 'WhatsApp desconectado com sucesso'
        };
      }

      return {
        success: true,
        message: 'WhatsApp já estava desconectado'
      };
    } catch (error) {
      console.error('Erro ao desconectar WhatsApp:', error);
      return {
        success: false,
        message: 'Erro ao desconectar WhatsApp'
      };
    }
  }

  getStatus(userId: number): { connected: boolean; qrCode?: string } {
    return {
      connected: this.isReady,
      qrCode: this.qrCode || undefined
    };
  }

  async sendMessage(to: string, message: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.isReady || !this.client) {
        return {
          success: false,
          message: 'WhatsApp não está conectado'
        };
      }

      // Format phone number
      const formattedNumber = to.includes('@c.us') ? to : `${to}@c.us`;
      
      await this.client.sendMessage(formattedNumber, message);
      
      return {
        success: true,
        message: 'Mensagem enviada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return {
        success: false,
        message: 'Erro ao enviar mensagem'
      };
    }
  }
}

export const whatsAppService = new WhatsAppService();