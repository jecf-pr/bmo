import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, Trash2, CheckCircle2, Trophy, Star,
  Target, Zap, Flame
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MetasPage() {
  const { toast } = useToast();
  const [goals, setGoals] = useState([
    { id: "1", title: "Beber 2L de água", completed: false, xp: 10, category: "Saúde", icon: "💧" },
    { id: "2", title: "Caminhar 15 min", completed: false, xp: 20, category: "Saúde", icon: "👟" },
    { id: "3", title: "Falar com um amigo", completed: false, xp: 15, category: "Social", icon: "💬" },
    { id: "4", title: "Praticar Respiração BMO", completed: false, xp: 25, category: "Mente", icon: "🧘" },
    { id: "5", title: "Anotar no Diário", completed: false, xp: 10, category: "Mente", icon: "📔" },
    { id: "6", title: "Comer uma fruta", completed: false, xp: 10, category: "Saúde", icon: "🍎" },
    { id: "7", title: "Ligar para os pais/família", completed: false, xp: 20, category: "Social", icon: "📞" },
  ]);
  const [newGoal, setNewGoal] = useState("");

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setGoals(prev => [...prev, { 
      id: Date.now().toString(), 
      title: newGoal, 
      completed: false,
      xp: 15,
      category: "Geral",
      icon: "✨"
    }]);
    setNewGoal("");
    toast({ title: "Nova meta!", description: "BMO está torcendo por você!" });
  };

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id && !g.completed) {
        toast({
          title: "Meta concluída! 🎉",
          description: `Você ganhou ${g.xp} de energia positiva!`,
        });
      }
      return g.id === id ? { ...g, completed: !g.completed } : g;
    }));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const completedCount = goals.filter(g => g.completed).length;
  const progress = goals.length > 0 ? (completedCount / goals.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 h-full overflow-y-auto pb-24 pt-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Target className="h-8 w-8 text-primary" />
          Minhas Jornadas
        </h1>
        <p className="text-muted-foreground italic">"Cada pequeno passo é uma grande vitória no mundo do BMO!"</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4 bg-primary/10 border-primary/20 flex flex-col items-center justify-center space-y-2">
          <Trophy className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">{completedCount}</span>
          <span className="text-xs font-bold uppercase text-primary">Concluídas</span>
        </Card>
        <Card className="p-4 bg-orange-500/10 border-orange-500/20 flex flex-col items-center justify-center space-y-2">
          <Flame className="h-8 w-8 text-orange-500" />
          <span className="text-2xl font-bold">5 Dias</span>
          <span className="text-xs font-bold uppercase text-orange-500">Sequência</span>
        </Card>
        <Card className="p-4 bg-yellow-500/10 border-yellow-500/20 flex flex-col items-center justify-center space-y-2">
          <Zap className="h-8 w-8 text-yellow-500" />
          <span className="text-2xl font-bold">150</span>
          <span className="text-xs font-bold uppercase text-yellow-500">Energia Total</span>
        </Card>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              Metas de Hoje
            </h2>
            <span className="text-sm font-bold text-primary">{Math.round(progress)}% Completo</span>
          </div>
          <Progress value={progress} className="h-3 shadow-inner" />
        </div>

        <div className="space-y-3">
          {goals.map(goal => (
            <div 
              key={goal.id} 
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                goal.completed 
                  ? "bg-primary/5 border-primary/20" 
                  : "bg-background border-transparent hover:border-primary/10 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-4">
                <Checkbox 
                  checked={goal.completed} 
                  onCheckedChange={() => toggleGoal(goal.id)}
                  id={goal.id}
                  className="w-6 h-6 border-2"
                />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{goal.icon || "🌟"}</span>
                      <label 
                        htmlFor={goal.id}
                        className={`text-lg font-bold leading-none cursor-pointer ${goal.completed ? "line-through text-muted-foreground opacity-50" : ""}`}
                      >
                        {goal.title}
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[10px] uppercase font-black text-yellow-600">
                        <Star className="h-3 w-3 fill-yellow-600" />
                        +{goal.xp} XP
                      </div>
                      <span className="text-[10px] uppercase font-bold text-primary/60 bg-primary/5 px-2 py-0.5 rounded-full">
                        {goal.category || "Geral"}
                      </span>
                    </div>
                  </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteGoal(goal.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-4">
          <Input 
            placeholder="O que vamos conquistar hoje?" 
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGoal()}
            className="h-12 text-lg"
          />
          <Button onClick={addGoal} size="icon" className="h-12 w-12 shadow-md">
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
