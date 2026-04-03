import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  GripVertical,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { setsApi, cardsApi } from "@/lib/api";
import { FlashcardSet, Flashcard } from "@/types/flashcard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CardInput {
  id: string;
  term: string;
  definition: string;
  isNew?: boolean;
  isDeleted?: boolean;
  isModified?: boolean;
}

export default function SetEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Set metadata
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [className, setClassName] = useState("");
  const [classSubject, setClassSubject] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  
  // Cards
  const [cards, setCards] = useState<CardInput[]>([]);
  const [originalCards, setOriginalCards] = useState<CardInput[]>([]);
  
  // Track changes
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchSet = async () => {
      if (!id) return;
      
      try {
        const data = await setsApi.getById(id);
        
        // Set metadata
        setTitle(data.set.title || "");
        setDescription(data.set.description || "");
        setClassName(data.set.class_name || "");
        setClassSubject(data.set.class_subject || "");
        setIsPublic(data.set.is_public ?? true);
        
        // Set cards
        const cardInputs: CardInput[] = (data.cards || []).map((card: Flashcard) => ({
          id: card.id,
          term: card.term,
          definition: card.definition,
          isNew: false,
          isDeleted: false,
          isModified: false,
        }));
        
        setCards(cardInputs);
        setOriginalCards(JSON.parse(JSON.stringify(cardInputs)));
        
      } catch (error) {
        console.error('Error fetching set:', error);
        toast.error('Failed to load set');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSet();
  }, [id, navigate]);

  // Track changes
  useEffect(() => {
    const cardsChanged = JSON.stringify(cards) !== JSON.stringify(originalCards);
    setHasChanges(cardsChanged);
  }, [cards, originalCards]);

  const addCard = () => {
    setCards(prev => [...prev, { 
      id: `new-${Date.now()}`, 
      term: "", 
      definition: "",
      isNew: true,
      isDeleted: false,
      isModified: false,
    }]);
  };

  const removeCard = (cardId: string) => {
    setCards(prev => prev.map(card => 
      card.id === cardId 
        ? { ...card, isDeleted: true }
        : card
    ));
  };

  const restoreCard = (cardId: string) => {
    setCards(prev => prev.map(card => 
      card.id === cardId 
        ? { ...card, isDeleted: false }
        : card
    ));
  };

  const updateCard = (cardId: string, field: "term" | "definition", value: string) => {
    setCards(prev => prev.map(card => 
      card.id === cardId 
        ? { ...card, [field]: value, isModified: !card.isNew }
        : card
    ));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title for your set");
      return;
    }

    const activeCards = cards.filter(card => !card.isDeleted);
    const validCards = activeCards.filter(card => card.term.trim() && card.definition.trim());
    
    if (validCards.length < 2) {
      toast.error("Please have at least 2 complete cards");
      return;
    }

    if (!token) {
      toast.error("You must be logged in to save changes");
      return;
    }

    setIsSaving(true);

    try {
      // Update set metadata
      await setsApi.update(id!, {
        title: title.trim(),
        description: description.trim(),
        class_name: className.trim() || null,
        class_subject: classSubject.trim() || null,
        is_public: isPublic
      });

      // Process card changes
      const newCards = cards.filter(c => c.isNew && !c.isDeleted && c.term.trim() && c.definition.trim());
      const deletedCards = cards.filter(c => c.isDeleted && !c.isNew);
      const modifiedCards = cards.filter(c => c.isModified && !c.isDeleted && !c.isNew);

      // Delete removed cards
      for (const card of deletedCards) {
        try {
          await cardsApi.delete(card.id);
        } catch (error) {
          console.error('Error deleting card:', error);
        }
      }

      // Update modified cards
      for (const card of modifiedCards) {
        try {
          await cardsApi.update(card.id, {
            term: card.term.trim(),
            definition: card.definition.trim()
          });
        } catch (error) {
          console.error('Error updating card:', error);
        }
      }

      // Create new cards
      if (newCards.length > 0) {
        await cardsApi.createMultiple({
          setId: id,
          cards: newCards.map(card => ({
            term: card.term.trim(),
            definition: card.definition.trim()
          }))
        });
      }

      toast.success("Set updated successfully!");
      navigate(`/set/${id}`);

    } catch (error) {
      console.error('Error saving set:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSet = async () => {
    if (!token || !id) {
      toast.error("Unable to delete set");
      return;
    }

    setIsDeleting(true);

    try {
      // Delete all cards first
      await cardsApi.deleteBySet(id);
      
      // Delete the set
      await setsApi.delete(id);

      toast.success("Set deleted successfully");
      navigate('/dashboard');

    } catch (error) {
      console.error('Error deleting set:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete set');
    } finally {
      setIsDeleting(false);
    }
  };

  const activeCards = cards.filter(card => !card.isDeleted);
  const deletedCards = cards.filter(card => card.isDeleted);
  const filledCards = activeCards.filter(c => c.term.trim() && c.definition.trim()).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading set...</p>
        </div>
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
          Back to Set
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display text-3xl font-bold">Edit Set</h1>
            <div className="flex items-center gap-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isDeleting}>
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete Set
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Delete Set
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this set? This action cannot be undone.
                      All {activeCards.length} cards will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteSet}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Set
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Set Details */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card mb-8">
            <h2 className="font-display text-lg font-bold mb-4">Set Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Title <span className="text-destructive">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter set title"
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a description for your set"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Class Name
                  </label>
                  <Input
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="e.g., Biology 101"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Subject
                  </label>
                  <Input
                    value={classSubject}
                    onChange={(e) => setClassSubject(e.target.value)}
                    placeholder="e.g., Science"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="isPublic" className="text-sm">
                  Make this set public (visible to other users)
                </label>
              </div>
            </div>
          </div>

          {/* Cards Section */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold">
                Cards ({filledCards} of {activeCards.length})
              </h2>
              <Button onClick={addCard} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </div>

            <div className="space-y-4">
              {activeCards.map((card, index) => (
                <div 
                  key={card.id}
                  className={cn(
                    "rounded-lg border p-4 transition-all",
                    card.isNew && "border-primary/50 bg-primary/5",
                    card.isModified && "border-yellow-500/50 bg-yellow-500/5"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground pt-2">
                      <GripVertical className="h-5 w-5" />
                      <span className="text-sm font-medium w-6">{index + 1}</span>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                          Term
                        </label>
                        <Input
                          value={card.term}
                          onChange={(e) => updateCard(card.id, "term", e.target.value)}
                          placeholder="Enter term"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                          Definition
                        </label>
                        <Input
                          value={card.definition}
                          onChange={(e) => updateCard(card.id, "definition", e.target.value)}
                          placeholder="Enter definition"
                        />
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCard(card.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {card.isNew && (
                    <div className="mt-2 text-xs text-primary">New card</div>
                  )}
                  {card.isModified && !card.isNew && (
                    <div className="mt-2 text-xs text-yellow-600">Modified</div>
                  )}
                </div>
              ))}

              {activeCards.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No cards yet. Click "Add Card" to create your first card.</p>
                </div>
              )}
            </div>

            {/* Deleted Cards Section */}
            {deletedCards.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Cards to be deleted ({deletedCards.length})
                </h3>
                <div className="space-y-2">
                  {deletedCards.map((card) => (
                    <div 
                      key={card.id}
                      className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <span className="text-sm line-through text-muted-foreground">
                          {card.term} — {card.definition}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => restoreCard(card.id)}
                        className="text-primary hover:text-primary"
                      >
                        Restore
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {hasChanges ? (
                <span className="text-yellow-600">You have unsaved changes</span>
              ) : (
                <span>No changes to save</span>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/set/${id}`)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || filledCards < 2}
                className="gap-2"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
