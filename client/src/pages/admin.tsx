import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { User } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";
import { Shield, Users, UserCog, Activity, Crown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Acesso Negado
            </CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta página.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: number; updates: Partial<User> }) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      
      if (!res.ok) {
        throw new Error("Falha ao atualizar usuário");
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Usuário atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleActive = (userId: number, isActive: boolean) => {
    updateUserMutation.mutate({
      userId,
      updates: { isActive },
    });
  };

  const handleRoleChange = (userId: number, role: string) => {
    updateUserMutation.mutate({
      userId,
      updates: { role },
    });
  };

  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Nunca";
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const activeUsers = users.filter(u => u.isActive).length;
  const adminUsers = users.filter(u => u.role === "admin").length;
  const recentUsers = users.filter(u => {
    if (!u.createdAt) return false;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(u.createdAt) >= sevenDaysAgo;
  }).length;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crown className="h-6 w-6 text-yellow-500" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Painel Administrativo
              </h1>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Admin
            </Badge>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeUsers} ativos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Administradores</CardTitle>
                  <UserCog className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    com privilégios admin
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Novos Usuários</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{recentUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    últimos 7 dias
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Usuários</CardTitle>
                <CardDescription>
                  Lista de todos os usuários registrados no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Último Login</TableHead>
                        <TableHead>Criado em</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((userItem) => (
                        <TableRow key={userItem.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {getInitials(userItem)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {userItem.firstName && userItem.lastName
                                    ? `${userItem.firstName} ${userItem.lastName}`
                                    : userItem.username}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  @{userItem.username}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{userItem.email}</TableCell>
                          <TableCell>
                            <Select
                              value={userItem.role}
                              onValueChange={(role) => handleRoleChange(userItem.id, role)}
                              disabled={userItem.id === user.id} // Can't change own role
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">Usuário</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={userItem.isActive}
                                onCheckedChange={(checked) => 
                                  handleToggleActive(userItem.id, checked)
                                }
                                disabled={userItem.id === user.id} // Can't deactivate own account
                              />
                              <Badge variant={userItem.isActive ? "default" : "secondary"}>
                                {userItem.isActive ? "Ativo" : "Inativo"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(userItem.lastLogin)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(userItem.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUser(userItem)}
                            >
                              Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}