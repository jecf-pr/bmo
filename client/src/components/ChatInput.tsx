import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = "Digite sua mensagem..." }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="sticky bottom-0 bg-background border-t border-border p-4">
      <div className="max-w-4xl mx-auto flex gap-2 items-end">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="resize-none min-h-12 max-h-32"
          rows={1}
          data-testid="input-chat-message"
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          size="icon"
          data-testid="button-send-message"
          aria-label="Enviar mensagem"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
