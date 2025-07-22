import { useState } from "react";
import { Search, Menu, LogOut, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationHeader } from "@/components/notification-header";
import { useAuth } from "@/hooks/useAuth";
import { User as UserType } from "@shared/schema";

export default function TopBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  const userTyped = user as UserType;
  
  const displayName = userTyped?.firstName && userTyped?.lastName 
    ? `${userTyped.firstName} ${userTyped.lastName}`
    : userTyped?.email?.split('@')[0] || 'Usuário';

  const initials = userTyped?.firstName && userTyped?.lastName
    ? `${userTyped.firstName[0]}${userTyped.lastName[0]}`
    : displayName.slice(0, 2).toUpperCase();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="lg:hidden">
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">TaskFlow</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar tarefas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10"
            />
          </div>
          
          {/* Notifications */}
          <NotificationHeader />
          
          {/* Profile */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userTyped?.profileImageUrl || ""} />
              <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-gray-900 dark:text-white hidden md:block">
              {displayName}
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = "/api/logout"}
              className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}