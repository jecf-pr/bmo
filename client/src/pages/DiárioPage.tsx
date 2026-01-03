import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Smile, Frown, Meh, Calendar, Save, History, 
  BookOpen, Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export default function DiárioPage() {
  const { toast } = useToast();
  const [mood, setMood] = useState<number | null>(null);
  const [entry, setEntry] = useState("");
  const [history, setHistory] = useState([
    {
      id: "1",
      mood: 4,
      content: "Hoje foi um dia produtivo. Consegui terminar minhas tarefas e tomei um café com um amigo.",
      date: new Date(Date.now() - 86400000),
    }
  ]);

  const handleSave = () => {
    if (!mood || !entry.trim()) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, selecione um humor e escreva algo sobre o seu dia.",
        variant: "destructive"
      });
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      mood,
      content: entry,
      date: new Date(),
    };

    setHistory([newEntry, ...history]);
    setEntry("");
    setMood(null);
    toast({
      title: "Diário atualizado",
      description: "Suas emoções foram guardadas com carinho pelo MIB.",
    });
  };

  const moodIcons = [
    { icon: Frown, val: 1, label: "Muito Triste" },
    { icon: Frown, val: 2, label: "Triste" },
    { icon: Meh, val: 3, label: "Ok" },
    { icon: Smile, val: 4, label: "Bem" },
    { icon: Smile, val: 5, label: "Muito Bem" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 h-full overflow-y-auto pb-24 pt-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Diário de Emoções
        </h1>
        <p className="text-muted-foreground italic">"Escrever é como dar um abraço na sua própria alma." - MIB</p>
      </div>

      <Card className="p-6 space-y-6 bg-card/50 backdrop-blur-sm">
        <div className="space-y-4">
          <label className="text-lg font-medium">Como você descreveria seu humor agora?</label>
          <div className="flex justify-between gap-2">
            {moodIcons.map(({ icon: Icon, val, label }) => (
              <button
                key={val}
                onClick={() => setMood(val)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all border-2 ${
                  mood === val 
                    ? "bg-primary text-primary-foreground border-primary scale-105 shadow-lg" 
                    : "bg-background border-transparent hover:border-primary/20 hover:bg-accent"
                }`}
              >
                <Icon className="h-10 w-10" />
                <span className="text-xs font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-lg font-medium flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            O que está passando pela sua cabeça?
          </label>
          <Textarea 
            placeholder="Sinta-se livre para desabafar... BMO está pronto para ler."
            className="min-h-[200px] text-lg resize-none bg-background/50"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
          />
        </div>

        <Button onClick={handleSave} className="w-full h-12 text-lg font-bold shadow-md hover-elevate">
          <Save className="mr-2 h-5 w-5" />
          Salvar no meu Diário
        </Button>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <History className="h-6 w-6 text-primary" />
          Lembranças Anteriores
        </h2>
        
        <div className="space-y-4">
          {history.map((h) => (
            <Card key={h.id} className="p-6 border-l-4 border-l-primary hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Calendar className="h-4 w-4" />
                  {format(h.date, "dd 'de' MMMM, yyyy", { locale: ptBR })}
                </div>
                <div className="bg-primary/10 px-3 py-1 rounded-full text-xs font-bold text-primary">
                  Humor: {h.mood}/5
                </div>
              </div>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed italic">
                "{h.content}"
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
