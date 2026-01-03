import { EmptyState } from "../EmptyState";
import { Waves } from "lucide-react";

export default function EmptyStateExample() {
  return (
    <div className="bg-background">
      <EmptyState
        icon={Waves}
        title="Nenhuma mensagem ainda"
        description="Envie sua primeira mensagem ao mar e receba mensagens anônimas de outras pessoas."
      />
    </div>
  );
}
