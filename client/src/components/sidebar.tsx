import { Link, useLocation } from "wouter";
import { 
  Home, 
  ListTodo, 
  MessageCircle, 
  BarChart3, 
  Settings,
  CheckCircle2
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  const menuItems = [
    { path: "/", icon: Home, label: "Painel", active: location === "/" },
    { path: "/tasks", icon: ListTodo, label: "Tarefas", active: location === "/tasks" },
    { path: "/whatsapp", icon: MessageCircle, label: "WhatsApp", active: location === "/whatsapp" },
    { path: "/reports", icon: BarChart3, label: "Relatórios", active: location === "/reports" },
    { path: "/settings", icon: Settings, label: "Configurações", active: location === "/settings" },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 hidden lg:block">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <ListTodo className="text-white w-4 h-4" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path} asChild>
                <a
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    item.active
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* WhatsApp Status */}
      <div className="p-6 border-t border-gray-200 mt-auto">
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-gray-600">WhatsApp Conectado</span>
        </div>
      </div>
    </aside>
  );
}