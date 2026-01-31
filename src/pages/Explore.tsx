import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { SetCard } from "@/components/flashcard/SetCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getPublicSets } from "@/data/mockData";
import { Search, TrendingUp, Clock, BookOpen } from "lucide-react";

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  
  const publicSets = getPublicSets();
  const filteredSets = publicSets.filter(set => 
    set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    set.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const categories = [
    { id: "all", label: "All Sets", icon: BookOpen },
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "recent", label: "Recent", icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-bold text-foreground">
            Explore Study Sets
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Discover flashcard sets created by the community
          </p>
        </div>
        
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSets.map((set, index) => (
            <div
              key={set.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <SetCard set={set} />
            </div>
          ))}
        </div>
        
        {filteredSets.length === 0 && (
          <div className="py-16 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 font-display text-xl font-bold text-foreground">
              No sets found
            </h2>
            <p className="mt-2 text-muted-foreground">
              Try a different search term or browse all categories
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
