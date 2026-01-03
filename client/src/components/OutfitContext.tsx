import { createContext, useContext, useState, ReactNode } from "react";
import { Cloud, Sun, Crown, Snowflake, Shirt, Star, Sparkles } from "lucide-react";

export type OutfitType = "Padrão" | "Inverno" | "Verão" | "Elegante";

interface OutfitContextType {
  outfit: OutfitType;
  setOutfit: (outfit: OutfitType) => void;
  getOrnament: (size?: "sm" | "lg") => ReactNode;
}

const OutfitContext = createContext<OutfitContextType | undefined>(undefined);

export function OutfitProvider({ children }: { children: ReactNode }) {
  const [outfit, setOutfit] = useState<OutfitType>("Padrão");

  const getOrnament = (size: "sm" | "lg" = "lg") => {
    const isSmall = size === "sm";
    
    switch (outfit) {
      case "Inverno":
        return (
          <>
            <div className={`absolute left-1/2 -translate-x-1/2 bg-blue-500 rounded-t-full border-blue-600 shadow-lg flex items-center justify-center ${isSmall ? "-top-2 w-8 h-3 border-b" : "-top-6 w-32 h-12 border-b-4"}`}>
              <div className={`${isSmall ? "w-2 h-2 -top-1" : "w-6 h-6 -top-3"} bg-white rounded-full absolute shadow-sm`} />
            </div>
            {!isSmall && (
              <>
                <div className="absolute top-4 right-4 animate-bounce delay-75">
                  <Snowflake className="h-6 w-6 text-blue-200" />
                </div>
                <div className="absolute top-12 left-2 animate-bounce">
                  <Snowflake className="h-4 w-4 text-blue-100" />
                </div>
              </>
            )}
          </>
        );
      case "Verão":
        return (
          <>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex z-10 ${isSmall ? "gap-1" : "gap-4"}`}>
              <div className={`${isSmall ? "w-4 h-2" : "w-16 h-8"} bg-black/80 rounded-full border border-white/20 backdrop-blur-sm`} />
              <div className={`${isSmall ? "w-4 h-2" : "w-16 h-8"} bg-black/80 rounded-full border border-white/20 backdrop-blur-sm`} />
            </div>
            {!isSmall && (
              <div className="absolute -top-12 -right-8 animate-spin-slow">
                <Sun className="h-16 w-16 text-yellow-400 fill-yellow-400 opacity-50" />
              </div>
            )}
          </>
        );
      case "Elegante":
        return (
          <>
            <div className={`absolute left-1/2 -translate-x-1/2 drop-shadow-xl ${isSmall ? "-top-3" : "-top-10"}`}>
              <Crown className={`${isSmall ? "h-4 w-4" : "h-16 w-16"} text-yellow-500 fill-yellow-500 animate-pulse`} />
            </div>
            <div className={`absolute left-1/2 -translate-x-1/2 z-20 flex items-center justify-center ${isSmall ? "-bottom-2" : "-bottom-6"}`}>
              <div className="relative">
                <div className={`${isSmall ? "w-2 h-2" : "w-8 h-8"} bg-primary rotate-45 rounded-sm`} />
                <div className={`${isSmall ? "w-2 h-2 -left-1" : "w-8 h-8 -left-4"} bg-primary rotate-45 rounded-sm absolute top-0`} />
                <div className={`${isSmall ? "w-2 h-2 -right-1" : "w-8 h-8 -right-4"} bg-primary rotate-45 rounded-sm absolute top-0`} />
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <OutfitContext.Provider value={{ outfit, setOutfit, getOrnament }}>
      {children}
    </OutfitContext.Provider>
  );
}

export function useOutfit() {
  const context = useContext(OutfitContext);
  if (!context) throw new Error("useOutfit must be used within OutfitProvider");
  return context;
}
