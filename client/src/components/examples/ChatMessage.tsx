import { ChatMessage } from "../ChatMessage";

export default function ChatMessageExample() {
  return (
    <div className="flex flex-col gap-4 p-4 bg-background">
      <ChatMessage
        role="user"
        content="Oi MIB, estou me sentindo um pouco ansioso hoje."
        timestamp={new Date()}
      />
      <ChatMessage
        role="assistant"
        content="Oi! BMO está aqui pra você. Ansiedade é algo que muita gente sente, e tudo bem reconhecer isso. Quer me contar um pouco mais sobre o que está te deixando ansioso?"
        timestamp={new Date()}
      />
    </div>
  );
}
