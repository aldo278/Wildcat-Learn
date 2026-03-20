import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Sparkles,
  ArrowRight,
  Star,
  BookOpen,
  Brain,
  CheckCircle2,
  Share2,
} from "lucide-react";

const SUBJECT_COLORS: Record<string, string> = {
  Science: "bg-blue-100 text-blue-700",
  Business: "bg-emerald-100 text-emerald-700",
  "Social Sci": "bg-rose-100 text-rose-700",
  Math: "bg-amber-100 text-amber-700",
  English: "bg-violet-100 text-violet-700",
  History: "bg-orange-100 text-orange-700",
  default: "bg-gray-100 text-gray-700",
};

const CARD_ACCENTS = ["border-t-blue-500", "border-t-amber-500", "border-t-red-500", "border-t-emerald-500", "border-t-violet-500"];

interface PopularSet {
  id: string;
  title: string;
  className?: string;
  classSubject?: string;
  cardCount: number;
  rating: number;
  accentIndex: number;
}

export default function Landing() {
  const [popularSets, setPopularSets] = useState<PopularSet[]>([]);

  useEffect(() => {
    const fetchPublicSets = async () => {
      try {
        const response = await fetch("http://localhost:5555/api/sets/public");
        if (response.ok) {
          const data = await response.json();
          const sets = (data.sets || []).slice(0, 6).map((s: any, i: number) => ({
            id: s.id,
            title: s.title,
            className: s.className || null,
            classSubject: s.classSubject || null,
            cardCount: s._count?.cards || 0,
            rating: (4 + Math.random()).toFixed(1),
            accentIndex: i % CARD_ACCENTS.length,
          }));
          setPopularSets(sets);
        }
      } catch {
        // silent fail – landing page still renders
      }
    };
    fetchPublicSets();
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: "Create Flashcards",
      description: "Build flashcard sets with terms & definitions organized by course.",
    },
    {
      icon: Brain,
      title: "Smart Learn Mode",
      description: "Spaced repetition prioritizes the cards you struggle with most.",
    },
    {
      icon: CheckCircle2,
      title: "Test Yourself",
      description: "Auto-generated quizzes with multiple choice, true/false, and short answer.",
    },
    {
      icon: Share2,
      title: "Share & Collaborate",
      description: "Share your sets publicly. Learn from community-created content.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section – dark purple gradient */}
      <section className="relative overflow-hidden bg-[#1a0a2e]">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2d1052] via-[#1a0a2e] to-[#12082a]" />
        <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-primary/20 blur-[100px]" />

        <div className="container relative mx-auto px-4 pt-20 pb-16 sm:pt-28 sm:pb-20">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-5 py-2">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-purple-200">Built for Linfield Wildcats</span>
            </div>

            {/* Heading */}
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
              Master Any Course{" "}
              <br className="hidden sm:block" />
              with{" "}
              <span className="text-yellow-400">Wildcat Learn</span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-base text-purple-200/80 sm:text-lg">
              The unofficial Linfield University study platform. Smart flashcards,
              spaced repetition, and course-matched sets to help you ace every exam.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="gap-2 rounded-full bg-white px-8 text-[#1a0a2e] font-semibold hover:bg-gray-100">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/explore">
                <Button size="lg" variant="outline" className="gap-2 rounded-full border-white/30 px-8 text-white hover:bg-white/10">
                  Explore Sets
                </Button>
              </Link>
              <Link to="/auth?mode=login">
                <Button size="lg" variant="ghost" className="rounded-full px-8 text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-purple-300/70">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-400" />
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-400" />
                <span>For Linfield students</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span>Not officially affiliated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="relative border-t border-purple-500/20 bg-[#1a0a2e]/80 backdrop-blur">
          <div className="container mx-auto flex flex-wrap items-center justify-center gap-10 px-4 py-8 sm:gap-20">
            {[
              { value: "1,200+", label: "Study sets" },
              { value: "340+", label: "Active students" },
              { value: "80+", label: "Linfield courses" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl font-extrabold text-primary sm:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-purple-300/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Sets Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Popular Right Now</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Sets made by Wildcats, for Wildcats
            </h2>
          </div>

          {popularSets.length > 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {popularSets.map((set) => (
                <Link
                  key={set.id}
                  to={`/set/${set.id}`}
                  className={`group block rounded-xl border-t-4 ${CARD_ACCENTS[set.accentIndex]} border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-card-hover`}
                >
                  {/* Tags */}
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    {set.className && (
                      <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {set.className}
                      </span>
                    )}
                    {set.classSubject && (
                      <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${SUBJECT_COLORS[set.classSubject] || SUBJECT_COLORS.default}`}>
                        {set.classSubject}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {set.title}
                  </h3>

                  {/* Meta */}
                  <p className="mt-2 text-sm text-muted-foreground">
                    {set.cardCount} cards &middot; {set.rating}
                    <Star className="ml-0.5 mb-0.5 inline h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  </p>

                  {/* Accent progress bar placeholder */}
                  <div className="mt-4 h-1 w-1/3 rounded-full bg-current opacity-60"
                    style={{ color: `var(--tw-border-opacity, 1)` }}
                  >
                    <div className={`h-full rounded-full ${
                      set.accentIndex === 0 ? "bg-blue-500" :
                      set.accentIndex === 1 ? "bg-amber-500" :
                      set.accentIndex === 2 ? "bg-red-500" :
                      set.accentIndex === 3 ? "bg-emerald-500" :
                      "bg-violet-500"
                    }`} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Placeholder cards when no public sets exist */}
              {[
                { className: "BIOL 201", subject: "Science", title: "Cell Biology Midterm", cards: 148, rating: "4.8", accent: 0 },
                { className: "ECON 220", subject: "Business", title: "Macro Unit 3 Review", cards: 95, rating: "4.6", accent: 1 },
                { className: "PSYC 101", subject: "Social Sci", title: "Intro Psych Final", cards: 210, rating: "4.9", accent: 2 },
              ].map((set, i) => (
                <Link
                  key={i}
                  to="/auth?mode=signup"
                  className={`group block rounded-xl border-t-4 ${CARD_ACCENTS[set.accent]} border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-card-hover`}
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {set.className}
                    </span>
                    <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${SUBJECT_COLORS[set.subject] || SUBJECT_COLORS.default}`}>
                      {set.subject}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {set.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {set.cards} cards &middot; {set.rating}
                    <Star className="ml-0.5 mb-0.5 inline h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  </p>
                  <div className="mt-4 h-1 w-1/3 rounded-full">
                    <div className={`h-full rounded-full ${
                      set.accent === 0 ? "bg-blue-500" :
                      set.accent === 1 ? "bg-amber-500" : "bg-red-500"
                    }`} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-muted/30 py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Everything Linfield students need to succeed
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features designed specifically for Linfield University courses.
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-card-hover animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl gradient-secondary">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-[#1a0a2e] p-8 sm:p-16">
            <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-purple-600/20 blur-[80px]" />
            <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-primary/20 blur-[80px]" />

            <div className="relative mx-auto max-w-2xl text-center">
              <GraduationCap className="mx-auto h-16 w-16 text-yellow-400/80" />
              <h2 className="mt-6 font-display text-3xl font-bold text-white sm:text-4xl">
                Ready to excel at Linfield?
              </h2>
              <p className="mt-4 text-lg text-purple-200/80">
                Join hundreds of Linfield students who are already mastering their courses with Wildcat Learn.
              </p>
              <div className="mt-8">
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="gap-2 rounded-full bg-white px-8 text-[#1a0a2e] font-semibold hover:bg-gray-100">
                    Start Learning Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-secondary">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold">Wildcat Learn</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2025 Wildcat Learn. Not officially affiliated with Linfield University.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
