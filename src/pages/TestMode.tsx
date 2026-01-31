import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSetById } from "@/data/mockData";
import { ProgressBar } from "@/components/flashcard/ProgressBar";
import { TestQuestion } from "@/types/flashcard";
import { ArrowLeft, Check, X, RotateCcw, Trophy, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function generateQuestions(set: ReturnType<typeof getSetById>): TestQuestion[] {
  if (!set) return [];
  
  const questions: TestQuestion[] = [];
  
  set.cards.forEach((card, index) => {
    // Randomly choose question type
    const types: TestQuestion["type"][] = ["multiple-choice", "true-false", "short-answer"];
    const type = types[index % 3];
    
    if (type === "multiple-choice") {
      // Get 3 wrong answers from other cards
      const wrongAnswers = set.cards
        .filter(c => c.id !== card.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(c => c.definition);
      
      const options = [...wrongAnswers, card.definition].sort(() => Math.random() - 0.5);
      
      questions.push({
        id: `q-${card.id}`,
        type: "multiple-choice",
        question: `What is the definition of "${card.term}"?`,
        correctAnswer: card.definition,
        options,
      });
    } else if (type === "true-false") {
      // Randomly decide if statement is true or false
      const isTrue = Math.random() > 0.5;
      const wrongCard = set.cards.find(c => c.id !== card.id);
      
      questions.push({
        id: `q-${card.id}`,
        type: "true-false",
        question: isTrue 
          ? `"${card.term}" means "${card.definition}"`
          : `"${card.term}" means "${wrongCard?.definition || "something else"}"`,
        correctAnswer: isTrue ? "True" : "False",
        options: ["True", "False"],
      });
    } else {
      questions.push({
        id: `q-${card.id}`,
        type: "short-answer",
        question: `What is the definition of "${card.term}"?`,
        correctAnswer: card.definition,
      });
    }
  });
  
  return questions.sort(() => Math.random() - 0.5);
}

export default function TestMode() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const set = getSetById(id || "");
  
  const [questions, setQuestions] = useState<TestQuestion[]>(() => generateQuestions(set));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [shortAnswer, setShortAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const answeredQuestions = questions.filter(q => q.userAnswer !== undefined);
  const correctCount = questions.filter(q => q.isCorrect).length;
  
  if (!set) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Set not found</h1>
          <Link to="/dashboard" className="mt-4 inline-block text-primary hover:underline">
            Go back to dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  const currentQuestion = questions[currentIndex];
  
  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;
    
    let answer = currentQuestion.type === "short-answer" ? shortAnswer : selectedAnswer;
    let isCorrect = false;
    
    if (currentQuestion.type === "short-answer") {
      // Case-insensitive comparison
      isCorrect = answer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
    } else {
      isCorrect = answer === currentQuestion.correctAnswer;
    }
    
    setQuestions(prev => prev.map(q => 
      q.id === currentQuestion.id 
        ? { ...q, userAnswer: answer, isCorrect }
        : q
    ));
    
    setIsAnswered(true);
  };
  
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer("");
      setShortAnswer("");
      setIsAnswered(false);
    } else {
      setIsComplete(true);
    }
  };
  
  const handleRestart = () => {
    setQuestions(generateQuestions(set));
    setCurrentIndex(0);
    setSelectedAnswer("");
    setShortAnswer("");
    setIsAnswered(false);
    setIsComplete(false);
  };
  
  const score = Math.round((correctCount / questions.length) * 100);
  
  if (isComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-lg text-center py-16">
            <div 
              className={cn(
                "mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full animate-bounce-in",
                score >= 70 ? "gradient-success" : "bg-secondary"
              )}
            >
              <Trophy className="h-12 w-12 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Test Complete!
            </h1>
            <p className="mt-4 text-5xl font-bold gradient-text">
              {score}%
            </p>
            <p className="mt-2 text-lg text-muted-foreground">
              {correctCount} out of {questions.length} correct
            </p>
            
            {score >= 70 ? (
              <p className="mt-4 text-success font-medium">Great job! 🎉</p>
            ) : (
              <p className="mt-4 text-secondary font-medium">Keep practicing! 💪</p>
            )}
            
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={handleRestart} variant="outline" size="lg" className="gap-2">
                <RotateCcw className="h-5 w-5" />
                Try Again
              </Button>
              <Link to={`/set/${id}/learn`}>
                <Button size="lg" className="w-full sm:w-auto">
                  Practice in Learn Mode
                </Button>
              </Link>
            </div>
            
            {/* Results breakdown */}
            <div className="mt-12 text-left">
              <h2 className="font-display text-lg font-bold mb-4">Review Your Answers</h2>
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <div 
                    key={q.id}
                    className={cn(
                      "p-4 rounded-lg border",
                      q.isCorrect ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {q.isCorrect ? (
                        <Check className="h-5 w-5 text-success mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-destructive mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{q.question}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Your answer: <span className={q.isCorrect ? "text-success" : "text-destructive"}>{q.userAnswer}</span>
                        </p>
                        {!q.isCorrect && (
                          <p className="text-sm text-success">
                            Correct: {q.correctAnswer}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          to={`/set/${id}`} 
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {set.title}
        </Link>
        
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">Test Mode</h1>
            <p className="mt-1 text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          
          {/* Progress */}
          <ProgressBar 
            current={currentIndex + 1} 
            total={questions.length} 
            className="mb-8"
          />
          
          {/* Question Card */}
          {currentQuestion && (
            <div className="rounded-2xl border border-border bg-card p-8 shadow-card animate-fade-in">
              {/* Question Type Badge */}
              <div className="mb-4">
                <span className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                  currentQuestion.type === "multiple-choice" && "bg-primary/10 text-primary",
                  currentQuestion.type === "true-false" && "bg-secondary/10 text-secondary",
                  currentQuestion.type === "short-answer" && "bg-success/10 text-success"
                )}>
                  {currentQuestion.type === "multiple-choice" && "Multiple Choice"}
                  {currentQuestion.type === "true-false" && "True or False"}
                  {currentQuestion.type === "short-answer" && "Short Answer"}
                </span>
              </div>
              
              {/* Question */}
              <h2 className="font-display text-xl font-bold text-foreground mb-6">
                {currentQuestion.question}
              </h2>
              
              {/* Answer Options */}
              {currentQuestion.type !== "short-answer" && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => !isAnswered && setSelectedAnswer(option)}
                      disabled={isAnswered}
                      className={cn(
                        "w-full rounded-lg border-2 p-4 text-left transition-all",
                        !isAnswered && selectedAnswer === option && "border-primary bg-primary/5",
                        !isAnswered && selectedAnswer !== option && "border-border hover:border-primary/50",
                        isAnswered && option === currentQuestion.correctAnswer && "border-success bg-success/10",
                        isAnswered && currentQuestion.userAnswer === option && option !== currentQuestion.correctAnswer && "border-destructive bg-destructive/10"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                          selectedAnswer === option ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="font-medium text-foreground">{option}</span>
                        {isAnswered && option === currentQuestion.correctAnswer && (
                          <Check className="ml-auto h-5 w-5 text-success" />
                        )}
                        {isAnswered && currentQuestion.userAnswer === option && option !== currentQuestion.correctAnswer && (
                          <X className="ml-auto h-5 w-5 text-destructive" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Short Answer Input */}
              {currentQuestion.type === "short-answer" && (
                <div>
                  <Input
                    value={shortAnswer}
                    onChange={(e) => setShortAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    disabled={isAnswered}
                    className={cn(
                      "text-lg",
                      isAnswered && currentQuestion.isCorrect && "border-success",
                      isAnswered && !currentQuestion.isCorrect && "border-destructive"
                    )}
                  />
                  {isAnswered && !currentQuestion.isCorrect && (
                    <p className="mt-2 text-sm text-success flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Correct answer: {currentQuestion.correctAnswer}
                    </p>
                  )}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="mt-8 flex justify-end gap-3">
                {!isAnswered ? (
                  <Button 
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer && !shortAnswer}
                    size="lg"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button onClick={handleNext} size="lg">
                    {currentIndex < questions.length - 1 ? "Next Question" : "See Results"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
