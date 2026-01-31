import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { SetCard } from "@/components/flashcard/SetCard";
import { Button } from "@/components/ui/button";
import { mockFlashcardSets } from "@/data/mockData";
import { Plus, Search, BookOpen, Brain, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock user's sets (in real app, filter by auth user)
  const userSets = mockFlashcardSets.filter(set => set.authorId === "user1");
  const filteredSets = userSets.filter(set => 
    set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    set.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const stats = {
    totalSets: userSets.length,
    totalCards: userSets.reduce((acc, set) => acc + set.cards.length, 0),
    totalStudies: userSets.reduce((acc, set) => acc + set.studyCount, 0),
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Welcome back! 👋
            </h1>
            <p className="mt-1 text-muted-foreground">
              Ready to continue learning?
            </p>
          </div>
          <Link to="/create">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Create Set
            </Button>
          </Link>
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
          {filteredSets.map((set, index) => (
            <div
              key={set.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <SetCard set={set} />
            </div>
          ))}
          
          {/* Create New Set Card */}
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
