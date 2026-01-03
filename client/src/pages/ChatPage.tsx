import { useState, useEffect, useRef } from "react";

import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { EmptyState } from "@/components/EmptyState";
import { MessageCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleClearChat = async () => {
    try {
      await fetch("/api/chat/clear", {
        method: "POST",
      });
      
      setMessages([]);
      toast({
        title: "Conversa limpa",
        description: "O MIB esqueceu todas as mensagens anteriores. Pode começar de novo!",
      });
    } catch (error) {
      console.error("Error clearing chat:", error);
      toast({
        title: "Erro",
        description: "Não foi possível limpar a conversa. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar mensagem");
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full pt-4">
      {messages.length > 0 && (
        <div className="border-b border-border p-2 flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" data-testid="button-clear-chat">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Conversa
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar conversa?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso vai fazer o MIB esquecer todas as mensagens enviadas. Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="button-cancel-clear">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearChat} data-testid="button-confirm-clear">
                  Limpar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      <div className="flex-1 overflow-y-auto pb-24">
        {messages.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="Olá! Sou o MIB"
            description="Estou aqui para te ouvir e oferecer apoio. Pode me contar o que está sentindo, sem pressa e sem julgamentos."
          />
        ) : (
      
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <ChatInput
        onSend={handleSendMessage}
        disabled={isTyping}
        placeholder="Digite sua mensagem para o MIB..."
      />
    </div>
  );
}
