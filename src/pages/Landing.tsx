import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Brain, 
  CheckCircle2, 
  GraduationCap, 
  Share2, 
  Sparkles,
  ArrowRight,
  Zap
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: BookOpen,
      title: "Create Flashcards",
      description: "Build beautiful flashcard sets with terms and definitions. Organize your learning materials effortlessly.",
    },
    {
      icon: Brain,
      title: "Smart Learn Mode",
      description: "Our intelligent learning algorithm prioritizes cards you struggle with, helping you master concepts faster.",
    },
    {
      icon: CheckCircle2,
      title: "Test Yourself",
      description: "Take auto-generated quizzes with multiple choice, true/false, and short answer questions.",
    },
    {
      icon: Share2,
      title: "Share & Collaborate",
      description: "Share your sets publicly or with specific users. Learn from thousands of community-created sets.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        
        <div className="container relative mx-auto px-4 py-20 sm:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Learn smarter, not harder</span>
            </div>
            
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              Master Anything with{" "}
              <span className="gradient-text">FlashLearn</span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              The ultimate flashcard study tool. Create sets, learn with smart algorithms, 
              test your knowledge, and share with others.
            </p>
            
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/auth?mode=signup">
                <Button size="xl" className="gradient-primary gap-2 px-8">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/explore">
                <Button variant="outline" size="xl" className="gap-2 px-8">
                  Explore Sets
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-warning" />
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>No credit card</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Everything you need to study effectively
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features designed to help you learn faster and remember longer.
            </p>
          </div>
          
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-card-hover animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl gradient-primary p-8 sm:p-16">
            <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            
            <div className="relative mx-auto max-w-2xl text-center">
              <GraduationCap className="mx-auto h-16 w-16 text-primary-foreground/80" />
              <h2 className="mt-6 font-display text-3xl font-bold text-primary-foreground sm:text-4xl">
                Ready to ace your next exam?
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/80">
                Join thousands of students who are already learning smarter with FlashLearn.
              </p>
              <div className="mt-8">
                <Link to="/auth?mode=signup">
                  <Button size="xl" variant="hero-outline" className="gap-2">
                    Start Learning Now
                    <ArrowRight className="h-5 w-5" />
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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <GraduationCap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">FlashLearn</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 FlashLearn. Learn smarter, achieve more.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
