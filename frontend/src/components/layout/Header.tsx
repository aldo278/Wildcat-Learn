import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isLoading } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navLinks = [
    { path: "/dashboard", label: "My Sets" },
    { path: "/ai-generate", label: "AI Generate" },
    { path: "/explore", label: "Explore" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <img src="/wildcat.ico" alt="Wildcat logo" className="h-5 w-5 object-contain" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">Wildcat Learn</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              <Button
                variant={isActive(link.path) ? "default" : "ghost"}
                size="sm"
                className={isActive(link.path) ? "" : "text-muted-foreground hover:text-foreground"}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>
        
        {/* Desktop Auth Section */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span className="text-muted-foreground">Welcome back, {user.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </div>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute left-0 right-0 top-16 border-b border-border bg-card p-4 md:hidden animate-slide-up">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant={isActive(link.path) ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : user ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground px-2">
                    <User className="h-4 w-4" />
                    <span>Welcome back, {user.name}</span>
                  </div>
                  <Button variant="outline" className="w-full justify-start" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
