import { MessageCircle, Waves, Heart, LineChart, Target, Palette, BookOpen, Phone, Wind } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import bmoImage from "@assets/bmorosto_1762035613823.jpg";
import { useOutfit } from "./OutfitContext";

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { getOrnament } = useOutfit();

  const modes = [
    {
      title: "Chat com MIB",
      url: "/",
      icon: MessageCircle,
    },
    {
      title: "Meu Diário",
      url: "/diario",
      icon: LineChart,
    },
    {
      title: "Minhas Metas",
      url: "/metas",
      icon: Target,
    },
    {
      title: "Estilo do MIB",
      url: "/custom",
      icon: Palette,
    },
    {
      title: "Respiração",
      url: "/respiracao",
      icon: Wind,
    },
    {
      title: "Estrelas Pontilhadas",
      url: "/estrelas",
      icon: Waves,
    },
    {
      title: "Recursos de Apoio",
      url: "/recursos",
      icon: Heart,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={bmoImage} alt="MIB" />
              <AvatarFallback className="bg-primary/10 text-primary">MIB</AvatarFallback>
            </Avatar>
            {getOrnament("sm")}
          </div>
          <div>
            <h2 className="font-semibold text-lg leading-tight">MIB</h2>
            <p className="text-xs text-muted-foreground">Apoio Psicológico</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {modes.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => setLocation(item.url)}
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Informações</SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <Card className="p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="font-medium">Sobre o MIB</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  MIB é um assistente baseado no BMO de Adventure Time, criado para oferecer apoio emocional de forma amigável e acolhedora.
                </p>
              </div>
            </Card>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Card className="p-4 bg-destructive/10 border-destructive/20">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-destructive" />
              <span className="font-semibold text-sm">Em Crise?</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Ligue para o CVV:
            </p>
            <p className="text-2xl font-bold text-destructive" data-testid="text-cvv-number">188</p>
            <p className="text-xs text-muted-foreground">
              Atendimento 24h, gratuito e sigiloso
            </p>
          </div>
        </Card>
      </SidebarFooter>
    </Sidebar>
  );
}
