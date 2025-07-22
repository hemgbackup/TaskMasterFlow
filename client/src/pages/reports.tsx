import Sidebar from "@/components/sidebar";
import TopBar from "@/components/top-bar";
import StatsCards from "@/components/stats-cards";

export default function ReportsPage() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-hidden">
        <TopBar />
        
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600">Métricas e estatísticas das suas tarefas</p>
          </div>
          
          <div className="space-y-6">
            <StatsCards />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Desempenho Mensal</h3>
                <p className="text-gray-500">Gráfico de desempenho será implementado</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Tarefas por Cliente</h3>
                <p className="text-gray-500">Relatório de clientes será implementado</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}