import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Palette, Shirt, Sparkles, Star, 
  Crown, Sun, Gem, Cloud, 
  Glasses, Snowflake
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import bmoImage from "@assets/bmorosto_1762035613823.jpg";
import { useOutfit, OutfitType } from "@/components/OutfitContext";

export default function CustomPage() {
  const { toast } = useToast();
  const { outfit, setOutfit, getOrnament } = useOutfit();

  const outfits: { name: OutfitType; icon: any; desc: string; color: string }[] = [
    { 
      name: "Padrão", 
      icon: Shirt, 
      desc: "O visual clássico e acolhedor do BMO.",
      color: "text-primary"
    },
    { 
      name: "Inverno", 
      icon: Cloud, 
      desc: "Cachecol quentinho e gorro de lã.",
      color: "text-blue-500"
    },
    { 
      name: "Verão", 
      icon: Sun, 
      desc: "Óculos de sol e muita alegria.",
      color: "text-orange-500"
    },
    { 
      name: "Elegante", 
      icon: Crown, 
      desc: "Gravata borboleta e muita classe.",
      color: "text-purple-500"
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 h-full overflow-y-auto pb-24 pt-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Palette className="h-8 w-8 text-primary" />
          Estilo do MIB
        </h1>
        <p className="text-muted-foreground italic">"BMO gosta de se vestir bem para te ajudar melhor!"</p>
      </div>

      <div className="flex justify-center py-12">
        <div className="relative">
          <Avatar className="h-48 w-48 border-8 border-primary shadow-2xl ring-4 ring-primary/20">
            <AvatarImage src={bmoImage} />
            <AvatarFallback className="text-4xl">MIB</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-primary px-6 py-2 rounded-full text-primary-foreground font-black shadow-lg">
            {outfit.toUpperCase()}
          </div>
          {getOrnament()}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {outfits.map((o) => (
          <Card 
            key={o.name}
            onClick={() => {
              setOutfit(o.name);
              toast({ 
                title: `MIB: ${o.name}`, 
                description: "Novo estilo aplicado com sucesso!",
              });
            }}
            className={`p-6 cursor-pointer transition-all border-2 flex gap-4 items-center group ${
              outfit === o.name 
                ? "bg-primary/10 border-primary shadow-md scale-[1.02]" 
                : "bg-background border-transparent hover:border-primary/20 hover:bg-accent/50"
            }`}
          >
            <div className={`p-4 rounded-2xl bg-background shadow-inner transition-transform group-hover:rotate-12 ${o.color}`}>
              <o.icon className="h-8 w-8" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-xl font-black">{o.name}</h3>
              <p className="text-sm text-muted-foreground">{o.desc}</p>
            </div>
            {outfit === o.name && (
              <div className="bg-primary rounded-full p-1">
                <Crown className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-8 bg-primary/5 border-dashed border-2 border-primary/20 text-center">
        <p className="text-primary font-bold">Mais estilos em breve... BMO está costurando!</p>
      </Card>
    </div>
  );
}

