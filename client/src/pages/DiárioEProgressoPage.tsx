import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Smile, Frown, Meh, 
  Plus, Trash2, Calendar, CheckCircle2,
  Palette, Shirt
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import bmoImage from "@assets/bmorosto_1762035613823.jpg";

export default function DiárioEProgressoPage() {
  const { toast } = useToast();
  
  // Mood State (Feature 1)
  const [mood, setMood] = useState<number | null>(null);
  const [moodHistory, setMoodHistory] = useState<{mood: number, date: Date}[]>([]);
  
  // Goals State (Feature 4)
  const [goals, setGoals] = useState<{id: string, title: string, completed: boolean}[]>([
    { id: "1", title: "Beber 2L de água", completed: false },
    { id: "2", title: "Caminhar 15 min", completed: false },
    { id: "3", title: "Escrever 3 gratidões", completed: false },
  ]);
  const [newGoal, setNewGoal] = useState("");

  // Personalization State (Feature 5)
  const [outfit, setOutfit] = useState("Padrão");
  const outfits = ["Padrão", "Inverno", "Verão", "Elegante"];

  const handleMoodSubmit = (selectedMood: number) => {
    setMood(selectedMood);
    setMoodHistory(prev => [{mood: selectedMood, date: new Date()}, ...prev]);
    toast({
      title: "Humor registrado!",
      description: "Obrigado por compartilhar como você se sente hoje.",
    });
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setGoals(prev => [...prev, { id: Date.now().toString(), title: newGoal, completed: false }]);
    setNewGoal("");
  };

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const completedCount = goals.filter(g => g.completed).length;
  const progress = goals.length > 0 ? (completedCount / goals.length) * 100 : 0;

  const moodIcons = [
    { icon: Frown, val: 1, label: "Muito Triste" },
    { icon: Frown, val: 2, label: "Triste" },
    { icon: Meh, val: 3, label: "Ok" },
    { icon: Smile, val: 4, label: "Bem" },
    { icon: Smile, val: 5, label: "Muito Bem" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Meu Bem-estar</h1>
          <p className="text-muted-foreground">Acompanhe seu progresso e cuide de você.</p>
        </div>
        <Card className="p-4 flex flex-col items-center gap-2 bg-primary/5">
           <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage src={bmoImage} />
              <AvatarFallback>MIB</AvatarFallback>
           </Avatar>
           <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-primary">MIB Status</p>
              <p className="text-sm font-bold">Estilo: {outfit}</p>
           </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Mood Section */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Como você está hoje?
            </h2>
            <div className="flex justify-between gap-2">
              {moodIcons.map(({ icon: Icon, val, label }) => (
                <button
                  key={val}
                  onClick={() => handleMoodSubmit(val)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                    mood === val ? "bg-primary text-primary-foreground scale-110" : "hover:bg-accent"
                  }`}
                >
                  <Icon className="h-8 w-8" />
                  <span className="text-[10px] font-medium">{label}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6">
             <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
               <Palette className="h-5 w-5 text-primary" />
               Personalizar MIB
             </h2>
             <div className="grid grid-cols-2 gap-3">
               {outfits.map(o => (
                 <Button 
                   key={o} 
                   variant={outfit === o ? "default" : "outline"}
                   onClick={() => {
                     setOutfit(o);
                     toast({ title: "MIB Atualizado!", description: `Agora o MIB está usando o estilo ${o}.` });
                   }}
                   className="justify-start gap-2"
                 >
                   <Shirt className="h-4 w-4" />
                   {o}
                 </Button>
               ))}
             </div>
          </Card>
        </div>

        {/* Goals Section */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Metas de Autocuidado
            </h2>
            <div className="mb-6 space-y-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Progresso Diário</span>
                <span>{completedCount} de {goals.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {goals.map(goal => (
                <div key={goal.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={goal.completed} 
                      onCheckedChange={() => toggleGoal(goal.id)}
                      id={goal.id}
                    />
                    <label 
                      htmlFor={goal.id}
                      className={`text-sm font-medium leading-none cursor-pointer ${goal.completed ? "line-through text-muted-foreground" : ""}`}
                    >
                      {goal.title}
                    </label>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteGoal(goal.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Input 
                placeholder="Nova meta..." 
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addGoal()}
              />
              <Button size="icon" onClick={addGoal}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </Card>
          
          {moodHistory.length > 0 && (
            <Card className="p-6">
               <h2 className="text-lg font-semibold mb-4">Histórico de Humor</h2>
               <div className="space-y-3">
                 {moodHistory.slice(0, 3).map((h, i) => (
                   <div key={i} className="flex justify-between items-center text-sm p-2 rounded bg-muted/30">
                     <span>{format(h.date, "dd 'de' MMMM", { locale: ptBR })}</span>
                     <span className="font-bold text-primary">Nota {h.mood}/5</span>
                   </div>
                 ))}
               </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
