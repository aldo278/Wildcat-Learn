import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GripVertical, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CardInput {
  id: string;
  term: string;
  definition: string;
}

export default function CreateSet() {
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
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
  
  const handleSubmit = (e: React.FormEvent) => {
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
    
    // In a real app, this would save to the database
    toast.success("Set created successfully!");
    navigate("/dashboard");
  };
  
  const filledCards = cards.filter(c => c.term.trim() && c.definition.trim()).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Create New Set
              </h1>
              <p className="mt-1 text-muted-foreground">
                Add flashcards to create your study set
              </p>
            </div>
            <Button type="submit" size="lg" className="gap-2">
              <Save className="h-5 w-5" />
              Save Set ({filledCards} cards)
            </Button>
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
                  placeholder='e.g. "Spanish Vocabulary" or "Biology Chapter 5"'
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
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Description (optional)
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
            <Button type="submit" size="lg" className="gap-2">
              <Save className="h-5 w-5" />
              Save Set ({filledCards} cards)
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
