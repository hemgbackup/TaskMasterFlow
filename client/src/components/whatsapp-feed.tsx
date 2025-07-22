import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { WhatsappMessage } from "@shared/schema";

export default function WhatsAppFeed() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: messages = [], isLoading } = useQuery<WhatsappMessage[]>({
    queryKey: ["/api/whatsapp/messages"],
  });

  const convertToTaskMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await apiRequest("POST", `/api/whatsapp/messages/${messageId}/convert`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Sucesso",
        description: "Mensagem convertida em tarefa com sucesso!"
      });
    },
    onError: () => {
      toast({
        title: "Erro", 
        description: "Falha ao converter mensagem em tarefa",
        variant: "destructive"
      });
    }
  });

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case "alta": return "⚡ Detectado: Alta prioridade";
      case "media": return "📋 Detectado: Solicitação";
      case "baixa": return "ℹ️ Detectado: Informação";
      default: return "📋 Detectado: Solicitação";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "alta": return "text-orange-600";
      case "media": return "text-blue-600";
      case "baixa": return "text-gray-600";
      default: return "text-blue-600";
    }
  };

  if (isLoading) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Mensagens Recentes</h3>
          <div className="flex items-center space-x-1 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Online</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`p-3 border border-gray-200 rounded-lg ${
                message.converted ? 'bg-green-50' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{message.contact}</span>
                <div className="flex items-center space-x-2">
                  {message.converted && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      ✓ Convertido
                    </Badge>
                  )}
                  <span className="text-xs text-gray-500">{message.time}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{message.content}</p>
              
              <div className="flex items-center justify-between">
                <span className={`text-xs ${getPriorityColor(message.priority || undefined)}`}>
                  {getPriorityLabel(message.priority || undefined)}
                </span>
                {!message.converted && (
                  <Button
                    variant="link"
                    size="sm"
                    className="text-primary hover:underline p-0 h-auto"
                    onClick={() => convertToTaskMutation.mutate(message.id)}
                    disabled={convertToTaskMutation.isPending}
                  >
                    Converter em tarefa
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {messages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma mensagem do WhatsApp</p>
              <p className="text-sm">Conecte seu WhatsApp para ver mensagens aqui</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
