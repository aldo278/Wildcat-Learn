import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { SetCard } from "@/components/flashcard/SetCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, Clock, BookOpen, GraduationCap, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [publicSets, setPublicSets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch public sets from backend
  useEffect(() => {
    const fetchPublicSets = async () => {
      try {
        const response = await fetch('http://localhost:5555/api/sets/public');
        
        if (!response.ok) {
          throw new Error('Failed to fetch public sets');
        }
        
        const data = await response.json();
        // Transform backend data to match frontend FlashcardSet interface
        const transformedSets = (data.sets || []).map((set: any) => ({
          ...set,
          cards: [],
          authorName: set.author?.name || 'Anonymous',
          cardCount: set._count?.cards || 0,
          className: set.className || null,
          classSubject: set.classSubject || null,
          studyCount: 0
        }));
        setPublicSets(transformedSets);
      } catch (error) {
        console.error('Error fetching public sets:', error);
        toast.error('Failed to load public flashcard sets');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPublicSets();
  }, []);
  
  const filteredSets = publicSets.filter((set: any) => 
    set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (set.description && set.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const categories = [
    { id: "all", label: "All Sets", icon: BookOpen },
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "recent", label: "Recent", icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <GraduationCap className="h-8 w-8 text-yellow-400" />
              <span className="bg-yellow-400 text-purple-900 px-3 py-1 rounded-full text-sm font-bold">
                Built for Linfield Wildcats
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
              Explore <span className="text-yellow-400">Study Sets</span>
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Discover flashcard sets created by the Linfield community
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        
        {/* Search */}
        <div className="mx-auto mb-8 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for any topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 text-lg"
            />
          </div>
        </div>
        
        {/* Categories */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              onClick={() => setActiveCategory(category.id)}
              className="gap-2"
            >
              <category.icon className="h-4 w-4" />
              {category.label}
            </Button>
          ))}
        </div>
        
        {/* Results Count */}
        <p className="mb-6 text-center text-muted-foreground">
          {filteredSets.length} sets found
        </p>
        
        {/* Sets Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, index) => (
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
            <div className="col-span-full py-16 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 font-display text-xl font-bold text-foreground">
                {searchQuery ? 'No sets found' : 'No public sets available'}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {searchQuery 
                  ? 'Try a different search term or browse all categories'
                  : 'Be the first to create a public flashcard set!'
                }
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
