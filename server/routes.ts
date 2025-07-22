import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertWhatsappMessageSchema, insertWhatsappConnectionSchema, insertNotificationSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Task routes
  app.get("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tasks = await storage.getTasks(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskData = insertTaskSchema.parse({ ...req.body, userId });
      const task = await storage.createTask(taskData);
      
      // Create notification for new task
      await storage.createNotification({
        userId,
        title: "Nova Tarefa Criada",
        message: `Tarefa "${task.title}" foi criada com sucesso`,
        type: "success",
      });
      
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid task data" });
    }
  });

  app.patch("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const task = await storage.updateTask(id, updates);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTask(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Stats route
  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getTaskStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // WhatsApp Messages routes
  app.get("/api/whatsapp/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getWhatsappMessages(userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch WhatsApp messages" });
    }
  });

  app.post("/api/whatsapp/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = insertWhatsappMessageSchema.parse({ ...req.body, userId });
      const message = await storage.createWhatsappMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid message data" });
    }
  });

  app.patch("/api/whatsapp/messages/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const message = await storage.updateWhatsappMessage(id, updates);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to update message" });
    }
  });

  // Convert WhatsApp message to task
  app.post("/api/whatsapp/messages/:id/convert", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageId = parseInt(req.params.id);
      const message = await storage.getWhatsappMessage(messageId);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Create task from message
      const taskData = insertTaskSchema.parse({
        userId,
        title: `Task from ${message.contact}`,
        description: message.content,
        priority: message.priority || "media",
        status: "pendente",
        client: message.contact,
        fromWhatsapp: true,
      });
      
      const task = await storage.createTask(taskData);
      
      // Mark message as converted
      await storage.updateWhatsappMessage(messageId, { converted: true });
      
      // Create notification
      await storage.createNotification({
        userId,
        title: "Mensagem Convertida",
        message: `Mensagem de ${message.contact} foi convertida em tarefa`,
        type: "success",
      });
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to convert message to task" });
    }
  });

  // WhatsApp Connection routes
  app.get("/api/whatsapp/connection", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const connection = await storage.getWhatsappConnection(userId);
      res.json(connection);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch WhatsApp connection" });
    }
  });

  app.post("/api/whatsapp/connection", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const connectionData = insertWhatsappConnectionSchema.parse({ ...req.body, userId });
      const connection = await storage.createWhatsappConnection(connectionData);
      res.json(connection);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid connection data" });
    }
  });

  app.patch("/api/whatsapp/connection", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;
      const connection = await storage.updateWhatsappConnection(userId, updates);
      
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      res.json(connection);
    } catch (error) {
      res.status(500).json({ message: "Failed to update WhatsApp connection" });
    }
  });

  // Generate QR Code for WhatsApp
  app.post("/api/whatsapp/qr", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Generate a mock QR code (in real implementation, this would connect to WhatsApp Business API)
      const qrCode = `https://wa.me/qr/MOCK_QR_CODE_${Date.now()}`;
      
      // Update or create WhatsApp connection
      const existingConnection = await storage.getWhatsappConnection(userId);
      
      if (existingConnection) {
        const connection = await storage.updateWhatsappConnection(userId, {
          qrCode,
          isConnected: false,
        });
        res.json(connection);
      } else {
        const connection = await storage.createWhatsappConnection({
          userId,
          qrCode,
          isConnected: false,
        });
        res.json(connection);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  // Notifications routes
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.markNotificationRead(id);
      
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}