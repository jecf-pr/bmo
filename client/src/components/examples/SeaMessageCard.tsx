import { SeaMessageCard } from "../SeaMessageCard";

export default function SeaMessageCardExample() {
  return (
    <div className="p-4 bg-background">
      <SeaMessageCard
        content="Às vezes me sinto sozinho, mas escrever aqui me ajuda a colocar meus pensamentos pra fora. Obrigado por existir, mar."
        timestamp={new Date()}
      />
    </div>
  );
}
