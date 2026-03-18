import { Link } from "react-router-dom";
import { FlashcardSet } from "@/types/flashcard";
import { BookOpen, Users, Lock, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface SetCardProps {
  set: FlashcardSet;
  className?: string;
}

export function SetCard({ set, className }: SetCardProps) {
  return (
    <Link
      to={`/set/${set.id}`}
      className={cn(
        "group block rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-card-hover",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {set.isPublic ? (
              <Globe className="h-4 w-4 text-success" />
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-xs font-medium text-muted-foreground">
              {set.isPublic ? "Public" : "Private"}
            </span>
          </div>
          <h3 className="mt-2 font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {set.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {set.description}
          </p>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {set.cardCount || set.cards?.length || 0} cards
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {set.studyCount}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          by {set.authorName}
        </span>
      </div>
    </Link>
  );
}
