import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import WhatsAppFeed from "@/components/whatsapp-feed";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Smartphone, MessageSquare, QrCode, Search, Filter, Wifi, WifiOff, RotateCcw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { SidebarLayout } from "@/components/sidebar-layout";

interface WhatsAppConnection {
  id: number;
  phoneNumber?: string;
  qrCode?: string;
  isConnected: boolean;
  lastConnected?: string;
}

export default function WhatsAppPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showQrCode, setShowQrCode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch WhatsApp connection status
  const { data: connection, isLoading: connectionLoading } = useQuery<WhatsAppConnection>({
    queryKey: ["/api/whatsapp/connection"],
    retry: false,
  });

  // Generate QR code mutation
  const generateQrMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/whatsapp/qr", "POST");
    },
    onSuccess: () => {
      setShowQrCode(true);
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/connection"] });
      toast({
        title: "QR Code gerado",
        description: "Escaneie o código com seu WhatsApp para conectar",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Não foi possível gerar o QR code",
        variant: "destructive",
      });
    },
  });

  // Simulate connection after QR scan (in real app, this would be WebSocket)
  const simulateConnection = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/whatsapp/connection", "PATCH", {
        isConnected: true,
        phoneNumber: "+55 11 99999-9999",
        lastConnected: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      setShowQrCode(false);
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/connection"] });
      toast({
        title: "WhatsApp Conectado!",
        description: "Sua conta foi conectada com sucesso",
      });
    },
  });

  // Auto-hide QR after 30 seconds
  useEffect(() => {
    if (showQrCode) {
      const timer = setTimeout(() => {
        setShowQrCode(false);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [showQrCode]);

  const handleConnectWhatsApp = () => {
    generateQrMutation.mutate();
  };

  const handleSimulateConnection = () => {
    simulateConnection.mutate();
  };

  return (
    <SidebarLayout>
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Smartphone className="h-8 w-8 text-green-600" />
              Integração WhatsApp
            </h1>
            <p className="text-muted-foreground mt-2">
              Conecte seu WhatsApp e gerencie mensagens de forma organizada
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Connection Status */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Status da Conexão
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {connection?.isConnected ? (
                    <>
                      <Wifi className="h-4 w-4 text-green-600" />
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                        Conectado
                      </Badge>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 text-red-600" />
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        Desconectado
                      </Badge>
                    </>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Número do Telefone</Label>
                  <Input 
                    id="phone" 
                    placeholder="Não conectado" 
                    value={connection?.phoneNumber || ""}
                    readOnly
                  />
                </div>
                
                {connection?.lastConnected && (
                  <div className="space-y-2">
                    <Label>Última Conexão</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(connection.lastConnected).toLocaleString("pt-BR")}
                    </p>
                  </div>
                )}
                
                {!connection?.isConnected ? (
                  <Button 
                    className="w-full" 
                    onClick={handleConnectWhatsApp}
                    disabled={generateQrMutation.isPending || showQrCode}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    {generateQrMutation.isPending ? "Gerando..." : "Conectar WhatsApp"}
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleConnectWhatsApp}
                    disabled={generateQrMutation.isPending}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reconectar
                  </Button>
                )}
                
                <p className="text-sm text-muted-foreground">
                  {showQrCode 
                    ? "Escaneie o QR code abaixo com seu WhatsApp" 
                    : "Clique em conectar para gerar um QR code"
                  }
                </p>
              </CardContent>
            </Card>

            {/* QR Code Display */}
            {showQrCode && connection?.qrCode && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">QR Code do WhatsApp</CardTitle>
                  <CardDescription className="text-center">
                    Escaneie com seu WhatsApp em até 30 segundos
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-inner">
                    <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <QrCode className="h-24 w-24 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Simule a conexão durante desenvolvimento
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleSimulateConnection}
                    disabled={simulateConnection.isPending}
                  >
                    Simular Conexão
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Messages Feed */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Feed de Mensagens</CardTitle>
                    <CardDescription>
                      {connection?.isConnected 
                        ? "Mensagens recentes do WhatsApp conectado" 
                        : "Conecte seu WhatsApp para ver as mensagens"
                      }
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">0 mensagens</Badge>
                </div>
                
                {/* Filters */}
                <div className="flex gap-2 pt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar mensagens..." 
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-32">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <WhatsAppFeed />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}