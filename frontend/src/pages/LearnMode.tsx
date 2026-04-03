import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { setsApi } from "@/lib/api";
import { FlashcardSet } from "@/types/flashcard";
import { ProgressBar } from "@/components/flashcard/ProgressBar";
import { ArrowLeft, Check, X, RotateCcw, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CardProgress {
  cardId: string;
  known: boolean;
  attempts: number;
}

export default function LearnMode() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [cardProgress, setCardProgress] = useState<CardProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    const fetchSet = async () => {
      if (!id) return;
      
      try {
        const data = await setsApi.getById(id);
        // Transform backend data to match frontend FlashcardSet interface
        const transformedSet: FlashcardSet = {
          ...data.set,
          cards: data.cards || [],
          author_name: data.set.author?.name || 'You',
          card_count: data.set._count?.cards || data.cards?.length || 0,
          class_name: data.set.class_name || null,
          class_subject: data.set.class_subject || null,
          study_count: 0
        };
        setSet(transformedSet);
      } catch (error) {
        console.error('Error fetching set:', error);
        toast.error('Failed to load set');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSet();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-muted-foreground">Loading set...</div>
        </div>
      </div>
    );
  }
  
  if (!set) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Set not found</h1>
          <Link to="/dashboard" className="mt-4 inline-block text-primary hover:underline">
            Go back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (set.cards.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold">No cards in this set</h1>
          <p className="mt-2 text-muted-foreground">Add some flashcards to start learning!</p>
          <Link to={`/set/${set.id}`} className="mt-4 inline-block text-primary hover:underline">
            Go back to set details
          </Link>
        </div>
      </div>
    );
  }
  
  // Cards that still need to be learned (not marked as known)
  const remainingCards = useMemo(() => {
    if (!set) return [];
    const knownCardIds = new Set(cardProgress.filter(p => p.known).map(p => p.cardId));
    return set.cards.filter(card => !knownCardIds.has(card.id));
  }, [set, cardProgress]);
  
  const knownCount = cardProgress.filter(p => p.known).length;
  const totalCards = set?.cards.length || 0;
  
  if (!set) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Set not found</h1>
          <Link to="/dashboard" className="mt-4 inline-block text-primary hover:underline">
            Go back to dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  const currentCard = remainingCards[currentIndex % remainingCards.length];
  
  const handleKnow = () => {
    if (!currentCard) return;
    
    setSwipeDirection("right");
    
    setTimeout(() => {
      setCardProgress(prev => {
        const existing = prev.find(p => p.cardId === currentCard.id);
        if (existing) {
          return prev.map(p => 
            p.cardId === currentCard.id 
              ? { ...p, known: true, attempts: p.attempts + 1 }
              : p
          );
        }
        return [...prev, { cardId: currentCard.id, known: true, attempts: 1 }];
      });
      
      if (remainingCards.length <= 1) {
        setIsComplete(true);
      } else {
        setCurrentIndex(prev => prev % (remainingCards.length - 1));
      }
      
      setIsFlipped(false);
      setSwipeDirection(null);
    }, 300);
  };
  
  const handleDontKnow = () => {
    if (!currentCard) return;
    
    setSwipeDirection("left");
    
    setTimeout(() => {
      setCardProgress(prev => {
        const existing = prev.find(p => p.cardId === currentCard.id);
        if (existing) {
          return prev.map(p => 
            p.cardId === currentCard.id 
              ? { ...p, attempts: p.attempts + 1 }
              : p
          );
        }
        return [...prev, { cardId: currentCard.id, known: false, attempts: 1 }];
      });
      
      // Move to next card (card stays in the deck)
      setCurrentIndex(prev => (prev + 1) % remainingCards.length);
      setIsFlipped(false);
      setSwipeDirection(null);
    }, 300);
  };
  
  const handleRestart = () => {
    setCardProgress([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsComplete(false);
  };
  
  if (isComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-lg text-center py-16">
            <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full gradient-success animate-bounce-in">
              <Trophy className="h-12 w-12 text-success-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Congratulations! 🎉
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              You've mastered all {totalCards} cards in this set!
            </p>
            
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={handleRestart} variant="outline" size="lg" className="gap-2">
                <RotateCcw className="h-5 w-5" />
                Study Again
              </Button>
              <Link to={`/set/${id}/test`}>
                <Button size="lg" className="w-full sm:w-auto">
                  Take a Test
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          to={`/set/${id}`} 
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {set.title}
        </Link>
        
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">Learn Mode</h1>
            <p className="mt-1 text-muted-foreground">
              {remainingCards.length} cards remaining
            </p>
          </div>
          
          {/* Progress */}
          <ProgressBar 
            current={knownCount} 
            total={totalCards} 
            className="mb-8"
          />
          
          {/* Flashcard */}
          {currentCard && (
            <div className="flashcard-container mb-8" onClick={() => setIsFlipped(!isFlipped)}>
              <div
                className={cn(
                  "flashcard relative h-80 w-full cursor-pointer",
                  isFlipped && "flipped",
                  swipeDirection === "right" && "swipe-right",
                  swipeDirection === "left" && "swipe-left"
                )}
              >
                {/* Front - Term */}
                <div className="flashcard-front absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-card p-8 shadow-card border border-border">
                  <span className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Term
                  </span>
                  <p className="text-center font-display text-3xl font-bold text-foreground">
                    {currentCard.term}
                  </p>
                  <span className="mt-6 text-sm text-muted-foreground">
                    Click to reveal answer
                  </span>
                </div>
                
                {/* Back - Definition */}
                <div className="flashcard-back absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-primary p-8 shadow-card">
                  <span className="mb-4 text-xs font-medium uppercase tracking-wider text-primary-foreground/70">
                    Definition
                  </span>
                  <p className="text-center font-display text-2xl font-semibold text-primary-foreground">
                    {currentCard.definition}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-6">
            <Button
              onClick={handleDontKnow}
              variant="outline"
              size="lg"
              className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-5 w-5" />
              Still Learning
            </Button>
            <Button
              onClick={handleKnow}
              size="lg"
              className="gap-2 bg-success hover:bg-success/90 text-success-foreground"
            >
              <Check className="h-5 w-5" />
              Got It!
            </Button>
          </div>
          
          {/* Stats */}
          <div className="mt-8 flex justify-center gap-8 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{knownCount}</p>
              <p className="text-muted-foreground">Mastered</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">{remainingCards.length}</p>
              <p className="text-muted-foreground">Remaining</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
