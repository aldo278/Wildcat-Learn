import { useState, useMemo, useEffect } from "react";
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
  
  // Check for AI-generated test questions first
  const [isAITest, setIsAITest] = useState(false);
  const [aiQuestions, setAiQuestions] = useState<TestQuestion[]>([]);
  const [aiClassInfo, setAiClassInfo] = useState<{className?: string, classSubject?: string}>({});
  
  const set = getSetById(id || "");
  
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [shortAnswer, setShortAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [skippedQuestions, setSkippedQuestions] = useState<Set<number>>(new Set());
  
  const answeredQuestions = questions.filter(q => q.userAnswer !== undefined);
  const correctCount = questions.filter(q => q.isCorrect).length;
  const wrongCount = answeredQuestions.filter(q => !q.isCorrect).length;
  const skippedCount = skippedQuestions.size;
  
  // Check for AI-generated test questions
  useEffect(() => {
    const storedTestData = sessionStorage.getItem('aiTestQuestions');
    if (storedTestData) {
      try {
        const testData = JSON.parse(storedTestData);
        const questions = testData.questions || testData; // Handle both old and new format
        setAiQuestions(questions);
        setQuestions(questions);
        setIsAITest(true);
        
        // Store class info for AI tests
        if (testData.className || testData.classSubject) {
          setAiClassInfo({
            className: testData.className,
            classSubject: testData.classSubject
          });
        }
      } catch (error) {
        console.error('Error parsing AI test questions:', error);
      }
    } else if (set) {
      // Use regular generated questions for non-AI tests
      setQuestions(generateQuestions(set));
    }
  }, [set]);
  
  if (!set && !isAITest) {
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
    if (isAITest && aiQuestions.length > 0) {
      // Reset AI-generated questions
      const resetQuestions = aiQuestions.map(q => ({ ...q, userAnswer: undefined, isCorrect: false }));
      setQuestions(resetQuestions);
    } else {
      // Reset regular generated questions
      setQuestions(generateQuestions(set));
    }
    setCurrentIndex(0);
    setSelectedAnswer("");
    setShortAnswer("");
    setIsAnswered(false);
    setIsComplete(false);
    setSkippedQuestions(new Set());
  };

  const handleSkip = () => {
    setSkippedQuestions(prev => new Set(prev).add(currentIndex));
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer("");
      setShortAnswer("");
      setIsAnswered(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleBackToDashboard = () => {
    // Clean up AI test questions from sessionStorage
    if (isAITest) {
      sessionStorage.removeItem('aiTestQuestions');
    }
    navigate('/dashboard');
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
              {isAITest ? (
                <Button onClick={handleBackToDashboard} size="lg" className="w-full sm:w-auto">
                  Back to Dashboard
                </Button>
              ) : (
                <Link to={`/set/${id}/learn`}>
                  <Button size="lg" className="w-full sm:w-auto">
                    Practice in Learn Mode
                  </Button>
                </Link>
              )}
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
          to={isAITest ? "/dashboard" : `/set/${id}`} 
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {isAITest ? "Dashboard" : set?.title}
        </Link>
        
        <div className="mx-auto max-w-2xl">
          {/* Header with Class Info */}
          <div className="mb-6">
            <div className="text-center mb-4">
              <h1 className="font-display text-3xl font-bold text-foreground">
                Test Yourself
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                {(set && set.className) || (isAITest && aiClassInfo.className) ? (
                  <span className="rounded-md bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    {set?.className || aiClassInfo.className}
                  </span>
                ) : null}
                {(set && set.classSubject) || (isAITest && aiClassInfo.classSubject) ? (
                  <span className="rounded-md bg-secondary/10 px-3 py-1 text-sm font-semibold text-secondary">
                    {set?.classSubject || aiClassInfo.classSubject}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          
          {/* Progress */}
          <ProgressBar 
            current={currentIndex + 1} 
            total={questions.length} 
            className="mb-6"
          />
          
          {/* Status Bar - Individual Question Dots */}
          <div className="mb-8">
            <div className="flex justify-center items-center gap-2">
              {questions.map((question, index) => {
                let dotColor = "bg-gray-300"; // Default: not answered
                if (question.isCorrect === true) {
                  dotColor = "bg-green-500"; // Correct
                } else if (question.isCorrect === false) {
                  dotColor = "bg-red-500"; // Wrong
                } else if (skippedQuestions.has(index)) {
                  dotColor = "bg-gray-400"; // Skipped
                }
                
                return (
                  <div
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      dotColor,
                      index === currentIndex && "ring-2 ring-primary ring-offset-2"
                    )}
                  />
                );
              })}
            </div>
          </div>
          
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
              {/* True/False Questions */}
              {currentQuestion.type === "true-false" && (
                <div className="grid grid-cols-2 gap-4">
                  {["True", "False"].map((option) => (
                    <button
                      key={option}
                      onClick={() => !isAnswered && setSelectedAnswer(option)}
                      disabled={isAnswered}
                      className={cn(
                        "rounded-lg border-2 p-4 text-center transition-all font-medium relative",
                        !isAnswered && selectedAnswer === option && "border-primary bg-primary/5 text-primary",
                        !isAnswered && selectedAnswer !== option && "border-border hover:border-primary/50",
                        isAnswered && option === currentQuestion.correctAnswer && "border-green-500 bg-green-50 text-green-800",
                        isAnswered && currentQuestion.userAnswer === option && option !== currentQuestion.correctAnswer && "border-red-500 bg-red-50 text-red-800"
                      )}
                    >
                      {isAnswered && option === currentQuestion.correctAnswer && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                      {isAnswered && currentQuestion.userAnswer === option && option !== currentQuestion.correctAnswer && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                          <X className="h-4 w-4" />
                        </div>
                      )}
                      <div className="flex items-center justify-center">
                        <span className="font-bold">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Multiple Choice Questions */}
              {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => !isAnswered && setSelectedAnswer(option)}
                      disabled={isAnswered}
                      className={cn(
                        "w-full rounded-lg border-2 p-4 text-left transition-all relative",
                        !isAnswered && selectedAnswer === option && "border-primary bg-primary/5",
                        !isAnswered && selectedAnswer !== option && "border-border hover:border-primary/50",
                        isAnswered && option === currentQuestion.correctAnswer && "border-green-500 bg-green-50",
                        isAnswered && currentQuestion.userAnswer === option && option !== currentQuestion.correctAnswer && "border-red-500 bg-red-50"
                      )}
                    >
                      {isAnswered && option === currentQuestion.correctAnswer && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                      {isAnswered && currentQuestion.userAnswer === option && option !== currentQuestion.correctAnswer && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-1">
                          <X className="h-4 w-4" />
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                          selectedAnswer === option ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                          isAnswered && option === currentQuestion.correctAnswer && "bg-green-500 text-white",
                          isAnswered && currentQuestion.userAnswer === option && option !== currentQuestion.correctAnswer && "bg-red-500 text-white"
                        )}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className={cn(
                          "font-medium flex-1",
                          isAnswered && option === currentQuestion.correctAnswer && "text-green-800",
                          isAnswered && currentQuestion.userAnswer === option && option !== currentQuestion.correctAnswer && "text-red-800"
                        )}>{option}</span>
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
                  {isAnswered && (
                  <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-sm font-medium text-blue-800 mb-1">Explanation:</p>
                    <p className="text-sm text-blue-700">
                      {currentQuestion.explanation || 
                       (currentQuestion.isCorrect 
                         ? "Great job! You got this question correct." 
                         : `The correct answer is: ${currentQuestion.correctAnswer}. Review this concept to improve your understanding.`)}
                    </p>
                  </div>
                )}
                {isAnswered && !currentQuestion.isCorrect && (
                  <p className="mt-2 text-sm text-success flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Correct answer: {currentQuestion.correctAnswer}
                  </p>
                )}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="mt-8 flex justify-between">
                {!isAnswered && (
                  <Button 
                    variant="outline"
                    onClick={handleSkip}
                    size="lg"
                  >
                    Skip
                  </Button>
                )}
                <div className="flex gap-3 ml-auto">
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
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
