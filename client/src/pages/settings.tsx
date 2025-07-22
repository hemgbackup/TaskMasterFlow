import Sidebar from "@/components/sidebar";
import TopBar from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-hidden">
        <TopBar />
        
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600">Personalize sua experiência no TaskFlow</p>
          </div>
          
          <div className="max-w-2xl space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Configurações do WhatsApp</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="webhook-url">URL do Webhook</Label>
                    <Input 
                      id="webhook-url" 
                      placeholder="https://seu-webhook.com/api/whatsapp" 
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="auto-convert">Conversão Automática</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Converter automaticamente mensagens urgentes em tarefas
                    </p>
                  </div>
                  <Button>Salvar Configurações</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Notificações</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Novas mensagens do WhatsApp</Label>
                      <p className="text-sm text-gray-500">Receber notificações de novas mensagens</p>
                    </div>
                    <Button variant="outline" size="sm">Ativado</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Tarefas com prazo</Label>
                      <p className="text-sm text-gray-500">Notificações de prazos próximos</p>
                    </div>
                    <Button variant="outline" size="sm">Ativado</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}