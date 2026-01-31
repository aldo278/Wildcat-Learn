import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { FlashcardDisplay } from "@/components/flashcard/FlashcardDisplay";
import { Button } from "@/components/ui/button";
import { getSetById } from "@/data/mockData";
import { 
  ArrowLeft, 
  BookOpen, 
  Brain, 
  CheckSquare, 
  Edit3, 
  Share2, 
  Users,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { ProgressBar } from "@/components/flashcard/ProgressBar";

export default function SetDetail() {
  const { id } = useParams<{ id: string }>();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
  const set = getSetById(id || "");
  
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
  
  const currentCard = set.cards[currentCardIndex];
  
  const goToPrevious = () => {
    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : set.cards.length - 1));
  };
  
  const goToNext = () => {
    setCurrentCardIndex((prev) => (prev < set.cards.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to My Sets
        </Link>
        
        {/* Set Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              {set.title}
            </h1>
            <p className="mt-2 text-muted-foreground">{set.description}</p>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {set.cards.length} cards
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {set.studyCount} studies
              </span>
              <span>by {set.authorName}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit3 className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
        
        {/* Study Mode Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Link
            to={`/set/${set.id}/flashcards`}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-card"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Flashcards</p>
              <p className="text-sm text-muted-foreground">Browse & flip cards</p>
            </div>
          </Link>
          
          <Link
            to={`/set/${set.id}/learn`}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-card"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 transition-colors group-hover:bg-secondary/20">
              <Brain className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Learn</p>
              <p className="text-sm text-muted-foreground">Smart study mode</p>
            </div>
          </Link>
          
          <Link
            to={`/set/${set.id}/test`}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-card"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 transition-colors group-hover:bg-success/20">
              <CheckSquare className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Test</p>
              <p className="text-sm text-muted-foreground">Quiz yourself</p>
            </div>
          </Link>
        </div>
        
        {/* Preview Flashcard */}
        <div className="mx-auto max-w-2xl">
          <ProgressBar 
            current={currentCardIndex + 1} 
            total={set.cards.length} 
            className="mb-6"
          />
          
          <FlashcardDisplay card={currentCard} />
          
          <div className="mt-6 flex items-center justify-center gap-4">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={goToPrevious}
              className="gap-2"
            >
              <ChevronLeft className="h-5 w-5" />
              Previous
            </Button>
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
        
        {/* All Cards List */}
        <div className="mt-12">
          <h2 className="mb-4 font-display text-xl font-bold text-foreground">
            All Cards ({set.cards.length})
          </h2>
          <div className="space-y-3">
            {set.cards.map((card, index) => (
              <div
                key={card.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => setCurrentCardIndex(index)}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                  {index + 1}
                </span>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <p className="font-medium text-foreground">{card.term}</p>
                  <p className="text-muted-foreground">{card.definition}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
