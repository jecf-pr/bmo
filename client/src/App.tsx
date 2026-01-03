import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { OutfitProvider } from "@/components/OutfitContext";
import ChatPage from "@/pages/ChatPage";
import DiárioPage from "@/pages/DiárioPage";
import MetasPage from "@/pages/MetasPage";
import CustomPage from "@/pages/CustomPage";
import RespiraçãoPage from "@/pages/RespiraçãoPage";
import EstrelasPage from "@/pages/EstrelasPage";
import RecursosPage from "@/pages/RecursosPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ChatPage} />
      <Route path="/diario" component={DiárioPage} />
      <Route path="/metas" component={MetasPage} />
      <Route path="/custom" component={CustomPage} />
      <Route path="/respiracao" component={RespiraçãoPage} />
      <Route path="/estrelas" component={EstrelasPage} />
      <Route path="/recursos" component={RecursosPage} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <OutfitProvider>
            <SidebarProvider style={style as React.CSSProperties}>
              <div className="flex h-screen w-full">
                <AppSidebar />
                <div className="flex flex-col flex-1">
                  <header className="fixed top-0 right-0 left-[var(--sidebar-width)] z-50 flex items-center justify-between p-2 border-b border-border bg-background/80 backdrop-blur-md transition-[left] duration-300 group-has-[[data-collapsible=icon]]/sidebar-wrapper:left-[var(--sidebar-width-icon)]">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <ThemeToggle />
                  </header>
                  <main className="flex-1 overflow-hidden">
                    <Router />
                  </main>
                </div>
              </div>
            </SidebarProvider>
          </OutfitProvider>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
