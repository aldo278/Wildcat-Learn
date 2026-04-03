import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { FlashcardDisplay } from "@/components/flashcard/FlashcardDisplay";
import { Button } from "@/components/ui/button";
import { setsApi } from "@/lib/api";
import { FlashcardSet } from "@/types/flashcard";
import { ProgressBar } from "@/components/flashcard/ProgressBar";
import { ArrowLeft, ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { toast } from "sonner";

export default function FlashcardsMode() {
  const { id } = useParams<{ id: string }>();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [shuffled, setShuffled] = useState(false);
  const [cardOrder, setCardOrder] = useState<number[]>([]);
  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
          <p className="mt-2 text-muted-foreground">Add some flashcards to start studying!</p>
          <Link to={`/set/${set.id}`} className="mt-4 inline-block text-primary hover:underline">
            Go back to set details
          </Link>
        </div>
      </div>
    );
  }
  
  const getCardIndex = (index: number) => {
    if (shuffled && cardOrder.length > 0) {
      return cardOrder[index];
    }
    return index;
  };
  
  const currentCard = set.cards[getCardIndex(currentCardIndex)];
  
  const goToPrevious = () => {
    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : set.cards.length - 1));
  };
  
  const goToNext = () => {
    setCurrentCardIndex((prev) => (prev < set.cards.length - 1 ? prev + 1 : 0));
  };
  
  const handleShuffle = () => {
    if (!shuffled) {
      const order = [...Array(set.cards.length).keys()].sort(() => Math.random() - 0.5);
      setCardOrder(order);
      setShuffled(true);
    } else {
      setCardOrder([]);
      setShuffled(false);
    }
    setCurrentCardIndex(0);
  };
  
  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
  };

  return (
    <div className="min-h-screen bg-background" onKeyDown={handleKeyDown} tabIndex={0}>
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
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Flashcards</h1>
              <p className="mt-1 text-muted-foreground">
                {set.title}
              </p>
            </div>
            <Button 
              variant={shuffled ? "default" : "outline"} 
              onClick={handleShuffle}
              className="gap-2"
            >
              <Shuffle className="h-4 w-4" />
              {shuffled ? "Shuffled" : "Shuffle"}
            </Button>
          </div>
          
          {/* Progress */}
          <ProgressBar 
            current={currentCardIndex + 1} 
            total={set.cards.length} 
            className="mb-8"
          />
          
          {/* Flashcard */}
          <FlashcardDisplay key={currentCard.id} card={currentCard} className="mb-8" />
          
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={goToPrevious}
              className="gap-2"
            >
              <ChevronLeft className="h-5 w-5" />
              Previous
            </Button>
            
            <span className="text-sm text-muted-foreground">
              Use ← → arrow keys to navigate
            </span>
            
            <Button 
              variant="outline" 
              size="lg" 
              onClick={goToNext}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
