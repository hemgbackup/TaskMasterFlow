import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@shared/schema";

interface TaskListProps {
  onEditTask: (task: Task) => void;
  onCreateTask: () => void;
}

export default function TaskList({ onEditTask, onCreateTask }: TaskListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, { 
        completed,
        status: completed ? "concluida" : "pendente" 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar tarefa",
        variant: "destructive"
      });
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta": return "bg-red-100 text-red-800";
      case "media": return "bg-yellow-100 text-yellow-800";
      case "baixa": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluida": return "bg-green-100 text-green-800";
      case "em-andamento": return "bg-yellow-100 text-yellow-800";
      case "pendente": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "concluida": return "Concluída";
      case "em-andamento": return "Em Andamento";
      case "pendente": return "Pendente";
      default: return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "alta": return "Alta";
      case "media": return "Média";
      case "baixa": return "Baixa";
      default: return priority;
    }
  };

  if (isLoading) {
    return (
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2">
      <Card className="border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Tarefas Recentes</h3>
            <div className="flex items-center space-x-2">
              <Button variant="default" size="sm">Todas</Button>
              <Button variant="ghost" size="sm">Urgentes</Button>
              <Button variant="ghost" size="sm">Hoje</Button>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6 space-y-4">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <Checkbox
                checked={task.completed || false}
                onCheckedChange={(checked) => 
                  updateTaskMutation.mutate({ 
                    id: task.id, 
                    completed: Boolean(checked) 
                  })
                }
                disabled={updateTaskMutation.isPending}
              />
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className={`font-medium text-gray-900 ${task.completed ? 'line-through' : ''}`}>
                    {task.title}
                  </h4>
                  <Badge className={getPriorityColor(task.priority)}>
                    {getPriorityLabel(task.priority)}
                  </Badge>
                  {task.fromWhatsapp && (
                    <Badge className="bg-green-100 text-green-800">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      WhatsApp
                    </Badge>
                  )}
                </div>
                
                <p className={`text-sm text-gray-600 ${task.completed ? 'line-through' : ''}`}>
                  {task.description}
                </p>
                
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  {task.client && <span>Cliente: {task.client}</span>}
                  {task.deadline && <span>Prazo: {task.deadline}</span>}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(task.status)}>
                  {getStatusLabel(task.status)}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditTask(task)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma tarefa encontrada</p>
              <p className="text-sm">Crie sua primeira tarefa ou importe do WhatsApp</p>
            </div>
          )}
        </CardContent>
        
        <div className="p-6 border-t border-gray-200">
          <Button 
            variant="outline" 
            className="w-full border-dashed border-2 h-12"
            onClick={onCreateTask}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Nova Tarefa
          </Button>
        </div>
      </Card>
    </div>
  );
}
