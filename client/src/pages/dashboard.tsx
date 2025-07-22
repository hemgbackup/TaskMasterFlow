import { useState, useEffect } from "react";
import { SidebarLayout } from "@/components/sidebar-layout";
import StatsCards from "@/components/stats-cards";
import TaskList from "@/components/task-list";
import QuickActions from "@/components/quick-actions";
import WhatsAppFeed from "@/components/whatsapp-feed";
import TaskModal from "@/components/task-modal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Dashboard() {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Não autorizado",
        description: "Você foi desconectado. Fazendo login novamente...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const openTaskModal = (task?: any) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarLayout>
      <div className="flex-1 p-6 overflow-y-auto">
        <StatsCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <TaskList onEditTask={openTaskModal} onCreateTask={() => openTaskModal()} />
          </div>
          
          <div className="space-y-6">
            <QuickActions onCreateTask={() => openTaskModal()} />
            <WhatsAppFeed />
          </div>
        </div>
      </div>
      
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={closeTaskModal} 
        editingTask={editingTask}
      />
    </SidebarLayout>
  );
}
