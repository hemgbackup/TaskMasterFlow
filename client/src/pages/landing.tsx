import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, MessageSquare, Calendar, BarChart3, Settings } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TaskFlow</h1>
          </div>
          <Button onClick={() => window.location.href = "/api/login"} size="lg">
            Entrar
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            🚀 Gerencie suas tarefas com eficiência
          </Badge>
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Organize seu dia com
            <span className="text-blue-600"> TaskFlow</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Transforme mensagens do WhatsApp em tarefas organizadas. 
            Gerencie projetos, acompanhe deadlines e maximize sua produtividade.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = "/api/login"}
              className="px-8 py-3"
            >
              Começar Agora
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3">
              Ver Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Integração WhatsApp</CardTitle>
              <CardDescription>
                Conecte seu WhatsApp via QR code e transforme mensagens em tarefas automaticamente
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <Calendar className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Gestão de Prazos</CardTitle>
              <CardDescription>
                Defina deadlines, acompanhe progresso e nunca mais perca um prazo importante
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Relatórios Completos</CardTitle>
              <CardDescription>
                Visualize sua produtividade com gráficos e métricas detalhadas
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CheckCircle className="h-12 w-12 text-emerald-600 mb-4" />
              <CardTitle>Controle de Status</CardTitle>
              <CardDescription>
                Organize tarefas por prioridade e status: pendente, em andamento, concluída
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <Settings className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>Configuração Flexível</CardTitle>
              <CardDescription>
                Personalize notificações, conexões e preferências do sistema
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white font-bold text-xl">∞</span>
              </div>
              <CardTitle>Painel Administrativo</CardTitle>
              <CardDescription>
                Controle completo com sistema de usuários e ativação por email
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-xl">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Pronto para otimizar sua produtividade?
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Faça login com sua conta Replit e comece a organizar suas tarefas agora mesmo.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = "/api/login"}
            className="px-12 py-4 text-lg"
          >
            Entrar no TaskFlow
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
        <p>&copy; 2025 TaskFlow. Desenvolvido com ❤️ para otimizar sua organização.</p>
      </footer>
    </div>
  );
}