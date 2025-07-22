import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MessageCircle, BarChart3 } from "lucide-react";

interface QuickActionsProps {
  onCreateTask: () => void;
}

export default function QuickActions({ onCreateTask }: QuickActionsProps) {
  const actions = [
    {
      icon: Plus,
      label: "Nova Tarefa",
      color: "bg-primary",
      onClick: onCreateTask
    },
    {
      icon: MessageCircle,
      label: "Importar do WhatsApp", 
      color: "bg-green-100 text-green-600",
      onClick: () => console.log("Import WhatsApp messages")
    },
    {
      icon: BarChart3,
      label: "Gerar Relatório",
      color: "bg-blue-100 text-blue-600", 
      onClick: () => console.log("Generate report")
    }
  ];

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="space-y-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start h-auto p-3"
                onClick={action.onClick}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                  action.color.includes('bg-primary') 
                    ? 'bg-primary text-white' 
                    : action.color
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-medium text-gray-900">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
