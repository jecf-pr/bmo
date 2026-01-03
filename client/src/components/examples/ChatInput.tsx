import { ChatInput } from "../ChatInput";

export default function ChatInputExample() {
  return (
    <div className="h-32 bg-background flex items-end">
      <div className="w-full">
        <ChatInput onSend={(msg) => console.log("Mensagem enviada:", msg)} />
      </div>
    </div>
  );
}
