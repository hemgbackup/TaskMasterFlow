import { useState } from "react";
import Sidebar from "@/components/sidebar";
import TopBar from "@/components/top-bar";
import StatsCards from "@/components/stats-cards";
import TaskList from "@/components/task-list";
import QuickActions from "@/components/quick-actions";
import WhatsAppFeed from "@/components/whatsapp-feed";
import TaskModal from "@/components/task-modal";

export default function Dashboard() {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  const openTaskModal = (task?: any) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-hidden">
        <TopBar />
        
        <div className="p-6 overflow-y-auto h-full">
          <StatsCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TaskList onEditTask={openTaskModal} onCreateTask={() => openTaskModal()} />
            
            <div className="space-y-6">
              <QuickActions onCreateTask={() => openTaskModal()} />
              <WhatsAppFeed />
            </div>
          </div>
        </div>
      </main>
      
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={closeTaskModal} 
        editingTask={editingTask}
      />
    </div>
  );
}
