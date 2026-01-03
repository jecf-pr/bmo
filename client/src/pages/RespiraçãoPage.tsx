import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wind, Zap, Shield, Sparkles, 
  ArrowRight, HeartPulse
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export default function RespiraçãoPage() {
  const { toast } = useToast();
  const [phase, setPhase] = useState<"Inalar" | "Segurar" | "Exalar" | "Pausa">("Inalar");
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setPhase((current) => {
              if (current === "Inalar") return "Segurar";
              if (current === "Segurar") return "Exalar";
              if (current === "Exalar") return "Pausa";
              return "Inalar";
            });
            return 0;
          }
          return prev + 2; // Aproximadamente 4s por fase
        });
      }, 80);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 h-full overflow-y-auto pb-24 pt-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Wind className="h-8 w-8 text-primary" />
          Respiração Guiada
        </h1>
        <p className="text-muted-foreground italic">"Siga o ritmo do MIB para acalmar seu coração."</p>
      </div>

      <div className="flex flex-col items-center justify-center py-12 space-y-12">
        <div className="relative flex items-center justify-center">
          {/* Círculo de Respiração */}
          <div 
            className={`rounded-full border-8 border-primary/20 flex items-center justify-center transition-all duration-[80ms] ${
              phase === "Inalar" ? "scale-150 bg-primary/10" : 
              phase === "Exalar" ? "scale-100 bg-background" : 
              "scale-125 bg-primary/5"
            }`}
            style={{ width: "200px", height: "200px" }}
          >
            <span className="text-2xl font-black text-primary animate-pulse">{phase}</span>
          </div>
          
          {/* Decorações flutuantes */}
          <Sparkles className="absolute -top-4 -right-4 h-8 w-8 text-yellow-400 animate-pulse" />
          <Zap className="absolute -bottom-4 -left-4 h-8 w-8 text-primary animate-bounce" />
        </div>

        <div className="w-full max-w-md space-y-4">
          <Progress value={progress} className="h-3 shadow-inner" />
          <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <span className={phase === "Inalar" ? "text-primary" : ""}>Inalar</span>
            <span className={phase === "Segurar" ? "text-primary" : ""}>Segurar</span>
            <span className={phase === "Exalar" ? "text-primary" : ""}>Exalar</span>
            <span className={phase === "Pausa" ? "text-primary" : ""}>Pausa</span>
          </div>
        </div>

        <Button 
          size="lg" 
          onClick={() => {
            setIsActive(!isActive);
            if (!isActive) {
              toast({ title: "Iniciando...", description: "Concentre-se no círculo." });
            }
          }}
          className="w-full max-w-xs h-16 text-xl font-black shadow-xl hover-elevate"
        >
          {isActive ? "Parar Exercício" : "Começar Agora"}
          <ArrowRight className="ml-2 h-6 w-6" />
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6 space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Shield className="h-5 w-5" />
            Por que respirar?
          </div>
          <p className="text-sm text-muted-foreground">
            A respiração rítmica ajuda a baixar os níveis de cortisol e avisa ao seu cérebro que você está seguro.
          </p>
        </Card>
        <Card className="p-6 space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold">
            <HeartPulse className="h-5 w-5" />
            Dica do MIB
          </div>
          <p className="text-sm text-muted-foreground">
            Tente inalar pelo nariz e exalar suavemente pela boca, como se estivesse soprando uma vela.
          </p>
        </Card>
      </div>
    </div>
  );
}
