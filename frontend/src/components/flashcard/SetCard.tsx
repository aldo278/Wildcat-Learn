import { Link } from "react-router-dom";
import { FlashcardSet } from "@/types/flashcard";
import { Star, Play, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SUBJECT_COLORS: Record<string, string> = {
  Science: "bg-blue-100 text-blue-700",
  Business: "bg-emerald-100 text-emerald-700",
  "Social Sci": "bg-rose-100 text-rose-700",
  Math: "bg-amber-100 text-amber-700",
  English: "bg-violet-100 text-violet-700",
  History: "bg-orange-100 text-orange-700",
  default: "bg-gray-100 text-gray-700",
};

const ACCENT_COLORS = [
  "border-t-blue-500",
  "border-t-amber-500",
  "border-t-red-500",
  "border-t-emerald-500",
  "border-t-violet-500",
];


interface SetCardProps {
  set: FlashcardSet;
  className?: string;
  accentIndex?: number;
}

export function SetCard({ set, className, accentIndex = 0 }: SetCardProps) {
  const idx = accentIndex % ACCENT_COLORS.length;
  const cardCount = set.card_count || set.cards?.length || 0;

  return (
    <div
      className={cn(
        "group rounded-xl border-t-4 border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-card-hover",
        ACCENT_COLORS[idx],
        className
      )}
    >
      {/* Tags */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {set.class_name && (
          <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {set.class_name}
          </span>
        )}
        {set.class_subject && (
          <span
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold",
              SUBJECT_COLORS[set.class_subject] || SUBJECT_COLORS.default
            )}
          >
            {set.class_subject}
          </span>
        )}
        {!set.class_name && !set.class_subject && (
          <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            {set.is_public ? "Public" : "Private"}
          </span>
        )}
      </div>

      {/* Title */}
      <Link 
        to={`/set/${set.id}`}
        className="block"
      >
        <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {set.title}
        </h3>

        {set.description && (
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
            {set.description}
          </p>
        )}
      </Link>

      {/* Meta */}
      <p className="mt-2 text-sm text-muted-foreground">
        {cardCount} cards
        <Star className="ml-1.5 mb-0.5 inline h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        by {set.author_name}
      </p>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2">
        <Link 
          to={`/set/${set.id}/flashcards`}
          className="flex-1"
        >
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full gap-1 text-xs"
          >
            <BookOpen className="h-3 w-3" />
            Study
          </Button>
        </Link>
        <Link 
          to={`/set/${set.id}/test`}
          className="flex-1"
        >
          <Button 
            size="sm" 
            className="w-full gap-1 text-xs"
          >
            <Play className="h-3 w-3" />
            Test
          </Button>
        </Link>
      </div>
    </div>
  );
}
