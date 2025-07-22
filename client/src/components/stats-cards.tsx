import { useQuery } from "@tanstack/react-query";
import { ListTodo, Clock, CheckCircle2, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery<{
    totalTasks: number;
    inProgress: number;
    completed: number;
    whatsappTasks: number;
  }>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Total de Tarefas",
      value: stats?.totalTasks || 0,
      icon: ListTodo,
      color: "bg-blue-100 text-blue-600",
      change: "+12%",
      changeColor: "text-green-600"
    },
    {
      title: "Em Andamento", 
      value: stats?.inProgress || 0,
      icon: Clock,
      color: "bg-yellow-100 text-yellow-600",
      change: "+3",
      changeColor: "text-yellow-600"
    },
    {
      title: "Concluídas",
      value: stats?.completed || 0,
      icon: CheckCircle2,
      color: "bg-green-100 text-green-600",
      change: "+5",
      changeColor: "text-green-600"
    },
    {
      title: "Via WhatsApp",
      value: stats?.whatsappTasks || 0,
      icon: MessageCircle,
      color: "bg-green-100 text-green-600",
      change: "+2",
      changeColor: "text-green-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm ${stat.changeColor}`}>{stat.change}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {index === 0 ? "vs mês anterior" : "hoje"}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
