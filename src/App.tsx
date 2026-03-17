import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import SetDetail from "./pages/SetDetail";
import FlashcardsMode from "./pages/FlashcardsMode";
import LearnMode from "./pages/LearnMode";
import TestMode from "./pages/TestMode";
import CreateSet from "./pages/CreateSet";
import Auth from "./pages/Auth";
import Explore from "./pages/Explore";
import AIGenerate from "./pages/AIGenerate";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/set/:id" element={<SetDetail />} />
          <Route path="/set/:id/flashcards" element={<FlashcardsMode />} />
          <Route path="/set/:id/learn" element={<LearnMode />} />
          <Route path="/set/:id/test" element={<TestMode />} />
          <Route path="/create" element={<CreateSet />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/ai-generate" element={<AIGenerate />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
