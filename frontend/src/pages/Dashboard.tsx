import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { SetCard } from "@/components/flashcard/SetCard";
import { Button } from "@/components/ui/button";
import { Plus, Search, BookOpen, Brain, FileText, Wand2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userSets, setUserSets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  
  // Fetch user's sets from backend
  useEffect(() => {
    const fetchUserSets = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch('http://localhost:5555/api/sets/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch sets');
        }
        
        const data = await response.json();
        // Transform backend data to match frontend FlashcardSet interface
        const transformedSets = (data.sets || []).map((set: any) => ({
          ...set,
          cards: [], // We'll load cards when navigating to the set detail page
          authorName: set.author?.name || 'You',
          cardCount: set._count?.cards || 0,
          studyCount: 0 // TODO: Add study tracking later
        }));
        setUserSets(transformedSets);
      } catch (error) {
        console.error('Error fetching sets:', error);
        toast.error('Failed to load your flashcard sets');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserSets();
  }, [token]);
  
  const filteredSets = userSets.filter((set: any) => 
    set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (set.description && set.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const stats = {
    totalSets: userSets.length,
    totalCards: userSets.reduce((acc: number, set: any) => acc + (set.cardCount || 0), 0),
    totalStudies: userSets.reduce((acc: number, set: any) => acc + (set.studyCount || 0), 0),
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Welcome back to Wildcat Learn! 👋
            </h1>
            <p className="mt-1 text-muted-foreground">
              Ready to excel in your Linfield courses?
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/ai-generate">
              <Button variant="outline" size="lg" className="gap-2">
                <Wand2 className="h-5 w-5" />
                AI Generate
              </Button>
            </Link>
            <Link to="/create">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Create Set
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalSets}</p>
                <p className="text-sm text-muted-foreground">Study Sets</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
                <FileText className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalCards}</p>
                <p className="text-sm text-muted-foreground">Total Cards</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <Brain className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalStudies}</p>
                <p className="text-sm text-muted-foreground">Study Sessions</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search your sets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Sets Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="min-h-[200px] rounded-xl border border-border bg-muted/20 animate-pulse"
              />
            ))
          ) : filteredSets.length > 0 ? (
            filteredSets.map((set: any, index: number) => (
              <div
                key={set.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <SetCard set={set} />
              </div>
            ))
          ) : (
            // Empty state
            <div className="col-span-full text-center py-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted/30 mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchQuery ? 'No sets found' : 'No flashcard sets yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? `No sets match "${searchQuery}". Try a different search term.`
                  : 'Create your first flashcard set to get started with learning.'
                }
              </p>
              {!searchQuery && (
                <Link to="/create">
                  <Button size="lg" className="gap-2">
                    <Plus className="h-5 w-5" />
                    Create Your First Set
                  </Button>
                </Link>
              )}
            </div>
          )}
          
          {/* Create New Set Card - only show if not loading and has sets */}
          {!isLoading && filteredSets.length > 0 && (
            <Link
              to="/create"
              className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 transition-colors hover:border-primary/50 hover:bg-muted/50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <p className="mt-4 font-medium text-foreground">Create New Set</p>
              <p className="mt-1 text-sm text-muted-foreground">Add flashcards to study</p>
            </Link>
          )}
        </div>
        
        {filteredSets.length === 0 && searchQuery && (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">No sets found matching "{searchQuery}"</p>
          </div>
        )}
      </main>
    </div>
  );
}
