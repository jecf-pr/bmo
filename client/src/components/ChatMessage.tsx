import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import bmoImage from "@assets/bmorosto_1762035613823.jpg";
import { useOutfit } from "./OutfitContext";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user";
  const { getOrnament } = useOutfit();

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      data-testid={`message-${role}`}
    >
      <div className="relative h-10 w-10 flex-shrink-0">
        <Avatar className="h-10 w-10">
          {!isUser && <AvatarImage src={bmoImage} alt="MIB" />}
          <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}>
            {isUser ? "VC" : "MIB"}
          </AvatarFallback>
        </Avatar>
        {!isUser && getOrnament("sm")}
      </div>
      
      <div className={`flex flex-col gap-1 max-w-lg ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-card-border"
          }`}
        >
          <p className="text-base leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
        <span className="text-xs text-muted-foreground px-2" data-testid="text-timestamp">
          {format(timestamp, "HH:mm", { locale: ptBR })}
        </span>
      </div>
    </div>
  );
}
