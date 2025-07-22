import Sidebar from "@/components/sidebar";
import TopBar from "@/components/top-bar";
import WhatsAppFeed from "@/components/whatsapp-feed";

export default function WhatsAppPage() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-hidden">
        <TopBar />
        
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">WhatsApp</h1>
            <p className="text-gray-600">Mensagens recebidas e conversão em tarefas</p>
          </div>
          
          <div className="max-w-2xl">
            <WhatsAppFeed />
          </div>
        </div>
      </main>
    </div>
  );
}