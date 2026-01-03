import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Waves } from "lucide-react";

interface SeaMessageCardProps {
  content: string;
  timestamp: Date;
}

export function SeaMessageCard({ content, timestamp }: SeaMessageCardProps) {
  return (
    <Card className="p-6 max-w-2xl" data-testid="card-sea-message">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
          <Waves className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-base leading-relaxed">{content}</p>
          <p className="text-xs text-muted-foreground" data-testid="text-timestamp">
            Recebida em {format(timestamp, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
      </div>
    </Card>
  );
}
