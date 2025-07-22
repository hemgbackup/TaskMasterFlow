import { useState } from "react";
import Sidebar from "@/components/sidebar";
import StatsCards from "@/components/stats-cards";
import TaskList from "@/components/task-list";
import QuickActions from "@/components/quick-actions";
import WhatsAppFeed from "@/components/whatsapp-feed";
import TaskModal from "@/components/task-modal";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const { user } = useAuth();

  const openTaskModal = (task?: any) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <main className="flex-1 overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Bem-vindo ao TaskFlow, {user?.firstName || user?.username}!
              </p>
            </div>
            <QuickActions onCreateTask={() => openTaskModal()} />
          </div>

          <StatsCards />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <TaskList 
                onEditTask={openTaskModal} 
                onCreateTask={() => openTaskModal()}
                limit={5}
              />
            </div>
            
            <div>
              <WhatsAppFeed limit={10} />
            </div>
          </div>

          <TaskModal
            isOpen={isTaskModalOpen}
            onClose={closeTaskModal}
            task={editingTask}
          />
        </div>
      </main>
    </div>
  );
}
