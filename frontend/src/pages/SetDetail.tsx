import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { FlashcardDisplay } from "@/components/flashcard/FlashcardDisplay";
import { AITestGenerator } from "@/components/test/AITestGenerator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FlashcardSet, Flashcard } from "@/types/flashcard";
import { 
  ArrowLeft, 
  BookOpen, 
  Brain, 
  CheckSquare, 
  Edit3, 
  Share2, 
  Users,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Save,
  X,
  GripVertical
} from "lucide-react";
import { useState, useEffect } from "react";
import { ProgressBar } from "@/components/flashcard/ProgressBar";
import { TestQuestion } from "@/types/flashcard";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { setsApi, cardsApi } from "@/lib/api";

export default function SetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [aiTestQuestions, setAiTestQuestions] = useState<TestQuestion[]>([]);
  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  
  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editClassName, setEditClassName] = useState('');
  const [editClassSubject, setEditClassSubject] = useState('');
  const [editCards, setEditCards] = useState<Flashcard[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
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
        const setData = await setsApi.getById(id!);
        
        // Fetch cards for this set
        const cardsData = await cardsApi.getBySet(id!);
        
        // Transform to match FlashcardSet interface
        const transformedSet: FlashcardSet = {
          ...setData.set,
          cards: cardsData.cards || [],
          author_name: setData.set.author?.name || 'You',
          class_name: setData.set.class_name || null,
          class_subject: setData.set.class_subject || null,
          study_count: 0
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
    // Store AI questions and class info in session storage for the test mode
    const testData = {
      questions,
      className: set.className,
      classSubject: set.classSubject
    };
    sessionStorage.setItem('aiTestQuestions', JSON.stringify(testData));
    navigate(`/set/${set.id}/test`);
  };

  const startEditing = () => {
    if (!set) return;
    setIsEditing(true);
    setEditTitle(set.title);
    setEditDescription(set.description || '');
    setEditClassName(set.className || '');
    setEditClassSubject(set.classSubject || '');
    setEditCards([...set.cards]);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditTitle('');
    setEditDescription('');
    setEditClassName('');
    setEditClassSubject('');
    setEditCards([]);
  };

  const addEditCard = () => {
    const newCard: Flashcard = {
      id: `new-${Date.now()}`,
      term: '',
      definition: '',
      createdAt: new Date(),
    };
    setEditCards([...editCards, newCard]);
  };

  const removeEditCard = (cardId: string) => {
    if (editCards.length <= 1) {
      toast.error('You need at least 1 card');
      return;
    }
    setEditCards(editCards.filter(card => card.id !== cardId));
  };

  const updateEditCard = (cardId: string, field: 'term' | 'definition', value: string) => {
    setEditCards(editCards.map(card => 
      card.id === cardId ? { ...card, [field]: value } : card
    ));
  };

  const saveChanges = async () => {
    if (!set || !token) return;

    if (!editTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const validCards = editCards.filter(card => card.term.trim() && card.definition.trim());
    if (validCards.length === 0) {
      toast.error('Please add at least 1 complete card');
      return;
    }

    setIsSaving(true);

    try {
      // Update set details
      const setResponse = await fetch(`http://localhost:5555/api/sets/${set.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
          className: editClassName.trim() || undefined,
          classSubject: editClassSubject.trim() || undefined,
        })
      });

      if (!setResponse.ok) {
        throw new Error('Failed to update set');
      }

      // Update cards - delete all existing cards and create new ones
      await fetch(`http://localhost:5555/api/cards/set/${set.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const cardsResponse = await fetch('http://localhost:5555/api/cards/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          setId: set.id,
          cards: validCards.map(card => ({
            term: card.term.trim(),
            definition: card.definition.trim()
          }))
        })
      });

      if (!cardsResponse.ok) {
        throw new Error('Failed to update cards');
      }

      // Update local state
      setSet({
        ...set,
        title: editTitle.trim(),
        description: editDescription.trim(),
        className: editClassName.trim() || null,
        classSubject: editClassSubject.trim() || null,
        cards: validCards
      });

      setIsEditing(false);
      toast.success('Set updated successfully!');
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
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
            {/* Class tags */}
            {(set.className || set.classSubject) && (
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {set.className && (
                  <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {set.className}
                  </span>
                )}
                {set.classSubject && (
                  <span className="rounded-md bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">
                    {set.classSubject}
                  </span>
                )}
              </div>
            )}
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
            {!isEditing ? (
              <>
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={startEditing}>
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="gap-2" onClick={cancelEditing} disabled={isSaving}>
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button size="sm" className="gap-2" onClick={saveChanges} disabled={isSaving}>
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </>
            )}
          </div>
        </div>
        
        {/* Edit Mode Form */}
        {isEditing && (
          <div className="mb-8 rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 font-display text-xl font-bold text-foreground">Edit Set Details</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Title</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Set title"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Class Name (optional)</label>
                  <Input
                    value={editClassName}
                    onChange={(e) => setEditClassName(e.target.value)}
                    placeholder='e.g. "BIOL 201"'
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Class Subject (optional)</label>
                  <Input
                    value={editClassSubject}
                    onChange={(e) => setEditClassSubject(e.target.value)}
                    placeholder='e.g. "Science"'
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Description (optional)</label>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Set description"
                  rows={2}
                />
              </div>
            </div>
          </div>
        )}
        
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
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-foreground">
              All Cards ({isEditing ? editCards.length : set.cards.length})
            </h2>
            {isEditing && (
              <Button onClick={addEditCard} variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Card
              </Button>
            )}
          </div>
          <div className="space-y-3">
            {(isEditing ? editCards : set.cards).map((card, index) => (
              <div
                key={card.id}
                className={`flex items-center gap-4 rounded-lg border border-border bg-card p-4 ${
                  !isEditing ? 'cursor-pointer hover:border-primary/30 transition-colors' : ''
                }`}
                onClick={!isEditing ? () => setCurrentCardIndex(index) : undefined}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                  {index + 1}
                </span>
                {isEditing ? (
                  <>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <Input
                        value={card.term}
                        onChange={(e) => updateEditCard(card.id, 'term', e.target.value)}
                        placeholder="Term"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Input
                        value={card.definition}
                        onChange={(e) => updateEditCard(card.id, 'definition', e.target.value)}
                        placeholder="Definition"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeEditCard(card.id);
                      }}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <p className="font-medium text-foreground">{card.term}</p>
                    <p className="text-muted-foreground">{card.definition}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
