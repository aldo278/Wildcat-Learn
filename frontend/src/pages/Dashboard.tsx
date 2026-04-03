import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { SetCard } from "@/components/flashcard/SetCard";
import { Button } from "@/components/ui/button";
import { Plus, Search, BookOpen, Brain, FileText, Wand2, GraduationCap, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { setsApi } from "@/lib/api";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userSets, setUserSets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token, user } = useAuth();
  
  // Fetch user's sets from backend
  useEffect(() => {
    const fetchUserSets = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        const data = await setsApi.getUserSets();
        // Transform backend data to match frontend FlashcardSet interface
        const transformedSets = (data.sets || []).map((set: any) => ({
          ...set,
          cards: [],
          author_name: set.author?.name || 'You',
          card_count: set._count?.cards || 0,
          class_name: set.class_name || null,
          class_subject: set.class_subject || null,
          study_count: 0
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
    totalCards: userSets.reduce((acc: number, set: any) => acc + (set.card_count || 0), 0),
    totalStudies: userSets.reduce((acc: number, set: any) => acc + (set.study_count || 0), 0),
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section - Condensed with Inline Stats */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-8">
          <div className="max-w-6xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Left: Welcome Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="h-8 w-8 text-yellow-400" />
                  <span className="bg-yellow-400 text-purple-900 px-3 py-1 rounded-full text-sm font-bold">
                    Built for Linfield Wildcats
                  </span>
                </div>
                <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                  Welcome Back, {user?.firstName || 'User'}! 👋
                </h1>
                <p className="text-lg md:text-xl text-purple-100 mb-6 max-w-2xl">
                  You have {stats.totalCards > 0 ? Math.min(14, stats.totalCards) : 0} cards due for review today. Keep your streak alive!
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/create">
                    <Button size="lg" className="bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold gap-2">
                      <Plus className="h-5 w-5" />
                      Create New Set
                    </Button>
                  </Link>
                  <Link to="/ai-generate">
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-purple-900 font-bold gap-2">
                      <Sparkles className="h-5 w-5" />
                      Generate Set
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Right: Inline Stats */}
              <div className="flex gap-6 lg:gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.totalSets}</div>
                  <div className="text-sm text-purple-200">Sets</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.totalCards}</div>
                  <div className="text-sm text-purple-200">Cards</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.totalStudies}</div>
                  <div className="text-sm text-purple-200">Sessions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-6">
        
        {/* Streak Bar */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-border p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🔥</span>
                </div>
                <span className="font-semibold text-foreground">7 Day Streak!</span>
              </div>
              <span className="text-sm text-muted-foreground">Keep it going!</span>
            </div>
            <div className="flex gap-1">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                <div
                  key={index}
                  className={`flex-1 h-8 rounded flex items-center justify-center text-xs font-medium ${
                    index < 5 
                      ? 'bg-orange-500 text-white' 
                      : index === 5 
                      ? 'bg-orange-100 text-orange-600 border-2 border-orange-300' 
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Due for Review Section */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">Due for Review</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-600 font-semibold">Overdue</span>
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold">2</span>
              </div>
              <p className="text-sm text-red-700">Math 101 • Biology Terms</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-yellow-600 font-semibold">Due Today</span>
                <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs font-bold">3</span>
              </div>
              <p className="text-sm text-yellow-700">History 202 • Spanish Vocab</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-600 font-semibold">Done</span>
                <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-bold">5</span>
              </div>
              <p className="text-sm text-green-700">Science 101 • English Lit</p>
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
        
        {/* Your Sets Section */}
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">Your Study Sets</h2>
          
          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button className="px-3 py-1 rounded-full bg-purple-600 text-white text-sm font-medium">
              All Sets
            </button>
            <button className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200">
              Math
            </button>
            <button className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200">
              Science
            </button>
            <button className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200">
              History
            </button>
            <button className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200">
              English
            </button>
            <button className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200">
              Spanish
            </button>
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
                <SetCard set={set} accentIndex={index} />
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
