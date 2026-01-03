import { useState, useEffect, useRef } from "react";
import { SeaMessageCard } from "@/components/SeaMessageCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { Waves, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SeaMessage {
  id: string;
  content: string;
  timestamp: Date;
}

export default function EstrelasPage() {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<SeaMessage[]>([
    {
      id: "1",
      content:
        "Hoje percebi que está tudo bem não estar bem o tempo todo. Às vezes a gente só precisa respirar fundo e seguir.",
      timestamp: new Date(Date.now() - 86400000),
    },
    {
      id: "2",
      content:
        "Escrever aqui me ajuda a organizar meus pensamentos. Obrigado, mar, por me ouvir sem julgar.",
      timestamp: new Date(Date.now() - 172800000),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    toast({
      title: "Mensagem enviada ao mar",
      description:
        "Sua mensagem foi enviada anonimamente. Em breve você pode receber uma mensagem de outra pessoa.",
    });

    const randomMessages = [
      "Às vezes só precisamos de um lugar seguro para colocar nossos sentimentos pra fora.",
      "Cada dia é uma nova chance de recomeçar. Não desista de você.",
      "A jornada de mil passos começa com um único passo. Você está no caminho certo.",
      "Está tudo bem pedir ajuda. Você é mais forte do que imagina.",
    ];

    setTimeout(() => {
      const received: SeaMessage = {
        id: Date.now().toString(),
        content:
          randomMessages[Math.floor(Math.random() * randomMessages.length)],
        timestamp: new Date(),
      };
      setMessages((prev) => [received, ...prev]);

      toast({
        title: "Nova mensagem do mar",
        description: "Você recebeu uma mensagem anônima.",
      });
    }, 3000);

    setNewMessage("");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 overflow-y-auto h-screen pt-20">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Estrelas Pontilhadas</h1>
        <p className="text-muted-foreground">
          Envie mensagens anônimas ao mar e receba mensagens de outras pessoas
          que também estão passando por momentos difíceis.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Waves className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Enviar ao Mar</h2>
          </div>

          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escreva sua mensagem anônima aqui... O que você está sentindo?"
            className="min-h-32 resize-none"
            data-testid="input-sea-message"
          />

          <p className="text-xs text-muted-foreground">
            Sua mensagem será enviada de forma completamente anônima. Ela pode
            aparecer para outra pessoa que também precisa de apoio.
          </p>

          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="w-full"
            data-testid="button-send-sea-message"
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar ao Mar
          </Button>
        </div>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Mensagens Recebidas</h2>
        {messages.length === 0 ? (
          <EmptyState
            icon={Waves}
            title="Nenhuma mensagem ainda"
            description="Envie sua primeira mensagem ao mar e você pode receber mensagens de outras pessoas em breve."
          />
        ) : (
          <div
            className="space-y-4 overflow-y-auto max-h-[400px] p-2 pr-3 rounded-lg border border-border"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#888 #111",
            }}
          >
            {messages.map((message) => (
              <SeaMessageCard
                key={message.id}
                content={message.content}
                timestamp={message.timestamp}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
