import { useState } from "react";
import { Flashcard } from "@/types/flashcard";
import { cn } from "@/lib/utils";

interface FlashcardDisplayProps {
  card: Flashcard;
  showDefinition?: boolean;
  className?: string;
}

export function FlashcardDisplay({ card, showDefinition = false, className }: FlashcardDisplayProps) {
  const [isFlipped, setIsFlipped] = useState(showDefinition);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className={cn("flashcard-container cursor-pointer", className)}
      onClick={handleFlip}
    >
      <div
        className={cn(
          "flashcard relative h-64 w-full sm:h-80",
          isFlipped && "flipped"
        )}
      >
        {/* Front - Term */}
        <div className="flashcard-front absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-card p-6 shadow-card border border-border">
          <span className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Term
          </span>
          <p className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
            {card.term}
          </p>
          <span className="mt-4 text-xs text-muted-foreground">
            Click to flip
          </span>
        </div>
        
        {/* Back - Definition */}
        <div className="flashcard-back absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-primary p-6 shadow-card">
          <span className="mb-2 text-xs font-medium uppercase tracking-wider text-primary-foreground/70">
            Definition
          </span>
          <p className="text-center font-display text-xl font-semibold text-primary-foreground sm:text-2xl">
            {card.definition}
          </p>
          <span className="mt-4 text-xs text-primary-foreground/70">
            Click to flip
          </span>
        </div>
      </div>
    </div>
  );
}
