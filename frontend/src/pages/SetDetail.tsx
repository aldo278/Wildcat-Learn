import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { FlashcardDisplay } from "@/components/flashcard/FlashcardDisplay";
import { AITestGenerator } from "@/components/test/AITestGenerator";
import { Button } from "@/components/ui/button";
import { FlashcardSet } from "@/types/flashcard";
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
import { useState, useEffect } from "react";
import { ProgressBar } from "@/components/flashcard/ProgressBar";
import { TestQuestion } from "@/types/flashcard";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function SetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [aiTestQuestions, setAiTestQuestions] = useState<TestQuestion[]>([]);
  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  
  // Check sessionStorage first for AI-generated sets, then fetch from backend
  useEffect(() => {
    const fetchSet = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      
      // Check sessionStorage first for AI-generated sets
      try {
        const tempAISet = sessionStorage.getItem('tempAISet');
        if (tempAISet) {
          const parsedSet = JSON.parse(tempAISet);
          if (parsedSet.id === id) {
            setSet(parsedSet);
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Error parsing AI set from sessionStorage:', error);
      }
      
      // Fetch from backend
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Fetch set details
        const setResponse = await fetch(`http://localhost:5555/api/sets/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        
        if (!setResponse.ok) {
          throw new Error('Set not found');
        }
        
        const setData = await setResponse.json();
        
        // Fetch cards for this set
        const cardsResponse = await fetch(`http://localhost:5555/api/cards/set/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        
        if (!cardsResponse.ok) {
          throw new Error('Failed to fetch cards');
        }
        
        const cardsData = await cardsResponse.json();
        
        // Transform to match FlashcardSet interface
        const transformedSet: FlashcardSet = {
          ...setData.set,
          cards: cardsData.cards || [],
          authorName: setData.set.author?.name || 'You',
          studyCount: 0 // TODO: Add study tracking later
        };
        
        setSet(transformedSet);
      } catch (error) {
        console.error('Error fetching set:', error);
        toast.error('Failed to load flashcard set');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSet();
  }, [id, token]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-48 mx-auto"></div>
          </div>
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
          <p className="mt-2 text-muted-foreground">This flashcard set doesn't exist or you don't have access to it.</p>
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

  const handleAITestGenerated = (questions: TestQuestion[]) => {
    setAiTestQuestions(questions);
    // Store AI questions in session storage for the test mode
    sessionStorage.setItem('aiTestQuestions', JSON.stringify(questions));
    navigate(`/set/${set.id}/test`);
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
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <div className="flex-1">
              <p className="font-semibold text-foreground">Test</p>
              <p className="text-sm text-muted-foreground">Quiz yourself</p>
            </div>
          </Link>
          
          {/* AI Test Generator */}
          <div className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 transition-colors group-hover:from-purple-500/20 group-hover:to-pink-500/20">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">AI Test</p>
              <p className="text-sm text-muted-foreground">Generate with AI</p>
            </div>
            <AITestGenerator 
              flashcards={set.cards} 
              onTestGenerated={handleAITestGenerated}
            />
          </div>
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
