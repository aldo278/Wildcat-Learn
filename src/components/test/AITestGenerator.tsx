import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAI } from '@/hooks/useAI';
import { Flashcard, TestQuestion, TestResult } from '@/types/flashcard';
import { 
  Wand2, 
  Clock, 
  HelpCircle, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  Play,
  Eye
} from 'lucide-react';

interface AITestGeneratorProps {
  flashcards: Flashcard[];
  onTestGenerated: (questions: TestQuestion[]) => void;
}

export function AITestGenerator({ flashcards, onTestGenerated }: AITestGeneratorProps) {
  const {
    isLoading,
    error,
    generatedTest,
    generateTest,
    clearError,
    clearResults,
  } = useAI();

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [questionCount, setQuestionCount] = useState([10]);
  const [questionTypes, setQuestionTypes] = useState<Array<'multiple-choice' | 'true-false' | 'short-answer'>>(['multiple-choice', 'true-false', 'short-answer']);

  const handleGenerate = async () => {
    try {
      clearError();
      await generateTest(flashcards, questionCount[0], questionTypes);
      toast.success('Test questions generated successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate test');
    }
  };

  const handleStartTest = () => {
    if (!generatedTest) return;

    const testQuestions: TestQuestion[] = generatedTest.questions.map((q, index) => ({
      id: `ai-question-${index}`,
      type: q.type,
      question: q.question,
      correctAnswer: q.correctAnswer,
      options: q.options,
    }));

    onTestGenerated(testQuestions);
    setIsConfigOpen(false);
    clearResults();
  };

  const handlePreview = () => {
    if (!generatedTest) return;

    const testQuestions: TestQuestion[] = generatedTest.questions.map((q, index) => ({
      id: `ai-question-${index}`,
      type: q.type,
      question: q.question,
      correctAnswer: q.correctAnswer,
      options: q.options,
    }));

    onTestGenerated(testQuestions);
    setIsConfigOpen(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple-choice': return '🔘';
      case 'true-false': return '✓';
      case 'short-answer': return '📝';
      default: return '❓';
    }
  };

  return (
    <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Wand2 className="h-4 w-4" />
          Generate AI Test
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Test Generator
          </DialogTitle>
          <DialogDescription>
            Create a customized test from your flashcards using AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}

          {/* Flashcard Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Source Material</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{flashcards.length} flashcards available</p>
                  <p className="text-xs text-muted-foreground">
                    Questions will be generated from these cards
                  </p>
                </div>
                <Badge variant="secondary">{flashcards.length} cards</Badge>
              </div>
            </CardContent>
          </Card>

          {!generatedTest ? (
            <>
              {/* Configuration */}
              <div className="space-y-4">
                {/* Question Count */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    Number of Questions: {questionCount[0]}
                  </label>
                  <Slider
                    value={questionCount}
                    onValueChange={setQuestionCount}
                    max={Math.min(30, flashcards.length)}
                    min={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>5</span>
                    <span>{Math.min(30, flashcards.length)}</span>
                  </div>
                </div>

                {/* Question Types */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Question Types
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'multiple-choice', label: 'Multiple Choice', icon: '🔘' },
                      { value: 'true-false', label: 'True/False', icon: '✓' },
                      { value: 'short-answer', label: 'Short Answer', icon: '📝' },
                    ].map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={type.value}
                          checked={questionTypes.includes(type.value as any)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setQuestionTypes([...questionTypes, type.value as any]);
                            } else {
                              setQuestionTypes(questionTypes.filter(t => t !== type.value));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={type.value} className="text-sm font-medium flex items-center gap-2">
                          <span>{type.icon}</span>
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isLoading || questionTypes.length === 0}
                className="w-full gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Generating Test...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Generate Test Questions
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              {/* Generated Test Preview */}
              <div className="space-y-4">
                {/* Test Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Test Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Questions</p>
                        <p className="text-2xl font-bold">{generatedTest.totalQuestions}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Estimated Time</p>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <p className="text-2xl font-bold">{generatedTest.estimatedTime}m</p>
                        </div>
                      </div>
                    </div>

                    {/* Question Type Distribution */}
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Question Types</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(
                          generatedTest.questions.reduce((acc, q) => {
                            acc[q.type] = (acc[q.type] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([type, count]) => (
                          <Badge key={type} variant="secondary" className="gap-1">
                            <span>{getTypeIcon(type)}</span>
                            {type}: {count}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty Distribution */}
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Difficulty Levels</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(
                          generatedTest.questions.reduce((acc, q) => {
                            acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([difficulty, count]) => (
                          <Badge key={difficulty} className={getDifficultyColor(difficulty)}>
                            {difficulty}: {count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Question Preview */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Question Preview</CardTitle>
                    <CardDescription>
                      First 3 questions of {generatedTest.totalQuestions}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {generatedTest.questions.slice(0, 3).map((q, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-start gap-2 mb-2">
                          <Badge variant="outline" className="gap-1">
                            <span>{getTypeIcon(q.type)}</span>
                            {q.type}
                          </Badge>
                          <Badge className={getDifficultyColor(q.difficulty)}>
                            {q.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mb-2">Q{index + 1}: {q.question}</p>
                        {q.options && (
                          <div className="text-xs text-muted-foreground">
                            <p>Options: {q.options.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      clearResults();
                    }}
                    className="flex-1"
                  >
                    Regenerate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handlePreview}
                    className="flex-1 gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview All
                  </Button>
                  <Button
                    onClick={handleStartTest}
                    className="flex-1 gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Start Test
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
