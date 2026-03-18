import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/explore" element={<Explore />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/create" element={
              <ProtectedRoute>
                <CreateSet />
              </ProtectedRoute>
            } />
            <Route path="/ai-generate" element={
              <ProtectedRoute>
                <AIGenerate />
              </ProtectedRoute>
            } />
            <Route path="/set/:id" element={
              <ProtectedRoute>
                <SetDetail />
              </ProtectedRoute>
            } />
            <Route path="/set/:id/flashcards" element={
              <ProtectedRoute>
                <FlashcardsMode />
              </ProtectedRoute>
            } />
            <Route path="/set/:id/learn" element={
              <ProtectedRoute>
                <LearnMode />
              </ProtectedRoute>
            } />
            <Route path="/set/:id/test" element={
              <ProtectedRoute>
                <TestMode />
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
