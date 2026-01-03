import { Card } from "@/components/ui/card";
import { Phone, Heart, BookOpen, Users, AlertCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import bmoImage from "@assets/bmorosto_1762035613823.jpg";
import { useOutfit } from "@/components/OutfitContext";

export default function RecursosPage() {
  const { getOrnament } = useOutfit();
  const resources = [
    {
      icon: Phone,
      title: "CVV - Centro de Valorização da Vida",
      description: "Atendimento 24 horas por dia, todos os dias da semana, de forma gratuita e sigilosa.",
      phone: "188",
      color: "destructive",
    },
    {
      icon: Heart,
      title: "CAPS - Centro de Atenção Psicossocial",
      description: "Unidades de saúde mental do SUS que oferecem atendimento psicológico e psiquiátrico gratuito.",
      phone: "136 (Disque Saúde)",
      color: "primary",
    },
    {
      icon: Users,
      title: "Mapa da Saúde Mental",
      description: "Encontre profissionais de saúde mental gratuitos ou com preços acessíveis na sua região.",
      link: "https://mapasaudemental.com.br",
      color: "primary",
    },
  ];

  const tips = [
    {
      icon: BookOpen,
      title: "Pratique o autocuidado",
      description: "Reserve tempo para atividades que você gosta e que te fazem bem.",
    },
    {
      icon: MessageCircle,
      title: "Converse sobre seus sentimentos",
      description: "Compartilhar o que você está sentindo pode aliviar o peso emocional.",
    },
    {
      icon: AlertCircle,
      title: "Reconheça seus limites",
      description: "Está tudo bem não estar bem. Pedir ajuda é um sinal de força, não de fraqueza.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-20 py-6 space-y-8 overflow-y-auto h-screen">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Recursos de Apoio</h1>
        <p className="text-muted-foreground">
          Informações e recursos para cuidar da sua saúde mental.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Ajuda Profissional</h2>
        <div className="grid gap-4">
          {resources.map((resource) => (
            <Card key={resource.title} className="p-6" data-testid="card-resource">
              <div className="flex gap-4">
                <div className={`bg-${resource.color}/10 p-3 rounded-lg h-fit`}>
                  <resource.icon className={`h-6 w-6 text-${resource.color}`} />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                  {resource.phone && (
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground mb-1">Telefone:</p>
                      <p className="text-2xl font-bold text-primary" data-testid="text-phone">
                        {resource.phone}
                      </p>
                    </div>
                  )}
                  {resource.link && (
                    <Button variant="outline" size="sm" asChild className="mt-2">
                      <a href={resource.link} target="_blank" rel="noopener noreferrer" data-testid="link-resource">
                        Acessar
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Dicas de Bem-estar</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {tips.map((tip) => (
            <Card key={tip.title} className="p-6" data-testid="card-tip">
              <div className="flex gap-3">
                <div className="bg-accent/50 p-2 rounded-lg h-fit">
                  <tip.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={bmoImage} alt="MIB" />
                <AvatarFallback className="bg-primary/10 text-primary">MIB</AvatarFallback>
              </Avatar>
              {getOrnament("sm")}
            </div>
            <h3 className="font-semibold text-lg">Sobre o MIB</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O MIB é um assistente virtual de apoio emocional baseado no personagem BMO de Adventure Time. 
            Ele foi criado por Ana, Juliana, Gabriel, Lais e José Eduardo para oferecer suporte e 
            acolhimento em momentos difíceis. Lembre-se: o MIB não substitui ajuda profissional, 
            mas está aqui para te ouvir sempre que precisar.
          </p>
        </div>
      </Card>
    </div>
  );
}
