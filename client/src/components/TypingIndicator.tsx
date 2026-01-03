import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import bmoImage from "@assets/bmorosto_1762035613823.jpg";
import { useOutfit } from "./OutfitContext";

export function TypingIndicator() {
  const { getOrnament } = useOutfit();

  return (
    <div className="flex gap-3" data-testid="typing-indicator">
      <div className="relative h-10 w-10 flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={bmoImage} alt="MIB" />
          <AvatarFallback className="bg-accent text-accent-foreground">
            MIB
          </AvatarFallback>
        </Avatar>
        {getOrnament("sm")}
      </div>
      
      <div className="flex flex-col gap-1">
        <div className="rounded-2xl px-4 py-3 bg-card border border-card-border">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
