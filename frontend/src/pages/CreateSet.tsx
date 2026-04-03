import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GripVertical, Save, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { setsApi, cardsApi } from "@/lib/api";

interface CardInput {
  id: string;
  term: string;
  definition: string;
}

export default function CreateSet() {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [className, setClassName] = useState("");
  const [classSubject, setClassSubject] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [cards, setCards] = useState<CardInput[]>([
    { id: "1", term: "", definition: "" },
    { id: "2", term: "", definition: "" },
    { id: "3", term: "", definition: "" },
  ]);
  
  const addCard = () => {
    setCards(prev => [...prev, { 
      id: String(Date.now()), 
      term: "", 
      definition: "" 
    }]);
  };
  
  const removeCard = (id: string) => {
    if (cards.length <= 2) {
      toast.error("You need at least 2 cards");
      return;
    }
    setCards(prev => prev.filter(card => card.id !== id));
  };
  
  const updateCard = (id: string, field: "term" | "definition", value: string) => {
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, [field]: value } : card
    ));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter a title for your set");
      return;
    }
    
    const validCards = cards.filter(card => card.term.trim() && card.definition.trim());
    if (validCards.length < 2) {
      toast.error("Please add at least 2 complete cards");
      return;
    }
    
    if (!token) {
      toast.error("You must be logged in to create a set");
      navigate("/auth");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Creating set with data:', {
        title: title.trim(),
        description: description.trim(),
        class_name: className.trim() || undefined,
        class_subject: classSubject.trim() || undefined,
        is_public: isPublic
      });
      
      // Create the flashcard set
      const setData = await setsApi.create({
        title: title.trim(),
        description: description.trim(),
        class_name: className.trim() || undefined,
        class_subject: classSubject.trim() || undefined,
        is_public: isPublic
      });
      
      console.log('Set created successfully:', setData);
      
      console.log('Creating cards for set:', setData.set.id, 'with cards:', validCards);
      
      // Create the flashcards
      try {
        const cardsData = await cardsApi.createMultiple({
          setId: setData.set.id,
          cards: validCards.map(card => ({
            term: card.term.trim(),
            definition: card.definition.trim()
          }))
        });
        console.log('Cards created successfully:', cardsData);
      } catch (cardError) {
        console.error('Failed to create cards, but set was created:', cardError);
        toast.warning('Set created but cards failed to save. Please try adding cards manually.');
        // Still navigate to the set page even if cards failed
        navigate(`/set/${setData.set.id}`);
        return;
      }
      
      toast.success("Set created successfully!");
      navigate(`/set/${setData.set.id}`);
      
    } catch (error) {
      console.error('Error creating set:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Check if it's a network error (backend not available)
      if (error instanceof Error && 
          (error.message.includes('Failed to fetch') || 
           error.message.includes('NetworkError') ||
           error.message.includes('ERR_CONNECTION_REFUSED'))) {
        toast.error('Backend server is not available. Please ensure the backend is running on port 5555.');
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to create set');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const filledCards = cards.filter(c => c.term.trim() && c.definition.trim()).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-8 w-8 text-yellow-400" />
              <span className="bg-yellow-400 text-purple-900 px-3 py-1 rounded-full text-sm font-bold">
                Built for Linfield Wildcats
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
              Create <span className="text-yellow-400">Study Set</span>
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-2xl">
              Build your personalized flashcard collection for any course
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Set Details
              </h2>
              <p className="mt-1 text-muted-foreground">
                Configure your flashcard set information
              </p>
            </div>
            <div>
              <Button type="submit" size="lg" className="gap-2" disabled={isLoading}>
                <Save className="h-5 w-5" />
                {isLoading ? "Saving..." : `Save Set (${filledCards} cards)`}
              </Button>
            </div>
          </div>
          
          {/* Set Details */}
          <div className="mb-8 rounded-2xl border border-border bg-card p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='e.g. "Cell Biology Midterm"'
                  className="text-lg"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Visibility
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={isPublic ? "default" : "outline"}
                    onClick={() => setIsPublic(true)}
                    className="flex-1"
                  >
                    Public
                  </Button>
                  <Button
                    type="button"
                    variant={!isPublic ? "default" : "outline"}
                    onClick={() => setIsPublic(false)}
                    className="flex-1"
                  >
                    Private
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Class Name <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Input
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder='e.g. "BIOL 201" or "ECON 220"'
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Class Subject <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Input
                  value={classSubject}
                  onChange={(e) => setClassSubject(e.target.value)}
                  placeholder='e.g. "Science", "Business", "Math"'
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Description <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this set about?"
                rows={2}
              />
            </div>
          </div>
          
          {/* Cards */}
          <div className="space-y-4">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 animate-fade-in"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCard(card.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Term
                    </label>
                    <Input
                      value={card.term}
                      onChange={(e) => updateCard(card.id, "term", e.target.value)}
                      placeholder="Enter term"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Definition
                    </label>
                    <Input
                      value={card.definition}
                      onChange={(e) => updateCard(card.id, "definition", e.target.value)}
                      placeholder="Enter definition"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Add Card Button */}
          <button
            type="button"
            onClick={addCard}
            className="mt-4 w-full rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
          >
            <Plus className="mx-auto h-8 w-8 text-primary" />
            <p className="mt-2 font-medium text-foreground">Add Card</p>
          </button>
          
          {/* Bottom Save Button */}
          <div className="mt-8 flex justify-end">
            <Button type="submit" size="lg" className="gap-2" disabled={isLoading}>
              <Save className="h-5 w-5" />
              {isLoading ? "Saving..." : `Save Set (${filledCards} cards)`}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
