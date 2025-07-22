import { useState } from "react";
import Sidebar from "@/components/sidebar";
import TopBar from "@/components/top-bar";
import TaskList from "@/components/task-list";
import TaskModal from "@/components/task-modal";

export default function TasksPage() {
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
        
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Tarefas</h1>
            <p className="text-gray-600">Visualize, crie e organize todas as suas tarefas</p>
          </div>
          
          <div className="max-w-4xl">
            <TaskList onEditTask={openTaskModal} onCreateTask={() => openTaskModal()} />
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