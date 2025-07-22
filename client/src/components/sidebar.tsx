import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Home, 
  ListTodo, 
  MessageCircle, 
  BarChart3, 
  Settings,
  Shield,
  LogOut,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  const menuItems = [
    { path: "/", icon: Home, label: "Dashboard", active: location === "/" },
    { path: "/tasks", icon: ListTodo, label: "Tarefas", active: location === "/tasks" },
    { path: "/whatsapp", icon: MessageCircle, label: "WhatsApp", active: location === "/whatsapp" },
    { path: "/reports", icon: BarChart3, label: "Relatórios", active: location === "/reports" },
    { path: "/settings", icon: Settings, label: "Configurações", active: location === "/settings" },
  ];

  // Add admin item if user is admin
  if (user.role === "admin") {
    menuItems.push({
      path: "/admin",
      icon: Shield,
      label: "Administração",
      active: location === "/admin"
    });
  }

  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

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
      
      {/* User Profile */}
      <div className="p-6 border-t border-gray-200 mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.username}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.role === "admin" ? "Administrador" : "Usuário"}
                  </div>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </Link>
            </DropdownMenuItem>
            {user.role === "admin" && (
              <DropdownMenuItem asChild>
                <Link href="/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Administração</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{logoutMutation.isPending ? "Saindo..." : "Sair"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}