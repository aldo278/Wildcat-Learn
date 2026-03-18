import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useAI } from '@/hooks/useAI';
import { FileParser, ParsedContent } from '@/lib/fileParser';
import { Flashcard, FlashcardSet } from '@/types/flashcard';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Upload, 
  Wand2, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Settings,
  Lightbulb,
  BookOpen,
  Save,
  Globe,
  Lock
} from 'lucide-react';

export default function AIGenerate() {
  const navigate = useNavigate();
  const {
    isLoading,
    error,
    generatedFlashcards,
    generateFlashcards,
    clearError,
    clearResults,
  } = useAI();
  const { token } = useAuth();

  const [step, setStep] = useState<'upload' | 'configure' | 'generate' | 'review' | 'save'>('upload');
  const [parsedContent, setParsedContent] = useState<ParsedContent | null>(null);
  const [cardCount, setCardCount] = useState([10]);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  
  // Save form states
  const [setTitle, setSetTitle] = useState('');
  const [setDescription, setSetDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileSelect = async (file: File) => {
    try {
      clearError();
      const content = await FileParser.parseFile(file);
      setParsedContent(content);
      setStep('configure');
      toast.success('File uploaded successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process file');
    }
  };

  const handleFileRemove = () => {
    setParsedContent(null);
    setStep('upload');
    clearResults();
  };

  const handleGenerate = async () => {
    if (!parsedContent) return;

    try {
      await generateFlashcards(
        parsedContent.text,
        cardCount[0],
        difficulty
      );
      setStep('review');
      toast.success('Flashcards generated successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate flashcards');
    }
  };

  const handleCardToggle = (index: number) => {
    setSelectedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (generatedFlashcards) {
      setSelectedCards(new Set(generatedFlashcards.flashcards.map((_, index) => index)));
    }
  };

  const handleDeselectAll = () => {
    setSelectedCards(new Set());
  };

  const handleCreateSet = () => {
    if (!generatedFlashcards || selectedCards.size === 0) {
      toast.error('Please select at least one flashcard');
      return;
    }

    // Pre-fill the form with generated content
    const defaultTitle = `AI Generated: ${parsedContent?.fileName?.replace(/\.[^/.]+$/, '') || 'Study Set'}`;
    const defaultDescription = `Generated from ${parsedContent?.fileName || 'uploaded file'} • ${selectedCards.size} cards • ${difficulty} difficulty`;
    
    setSetTitle(defaultTitle);
    setSetDescription(defaultDescription);
    setStep('save');
  };

  const handleSaveSet = async () => {
    if (!token) {
      toast.error('You must be logged in to save a set');
      navigate('/auth');
      return;
    }

    if (!generatedFlashcards || selectedCards.size === 0) {
      toast.error('Please select at least one flashcard');
      return;
    }

    if (!setTitle.trim()) {
      toast.error('Please enter a title for your set');
      return;
    }

    setIsSaving(true);

    try {
      // Create the flashcard set
      const setResponse = await fetch('http://localhost:3001/api/sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: setTitle.trim(),
          description: setDescription.trim(),
          isPublic
        })
      });
      
      if (!setResponse.ok) {
        const errorData = await setResponse.json();
        throw new Error(errorData.message || 'Failed to create set');
      }
      
      const setData = await setResponse.json();
      
      // Create the flashcards
      const selectedFlashcards: Flashcard[] = Array.from(selectedCards).map(index => ({
        id: `ai-${Date.now()}-${index}`,
        term: generatedFlashcards.flashcards[index].term,
        definition: generatedFlashcards.flashcards[index].definition,
        createdAt: new Date(),
      }));

      const cardsResponse = await fetch('http://localhost:3001/api/cards/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          setId: setData.set.id,
          cards: selectedFlashcards.map(card => ({
            term: card.term,
            definition: card.definition
          }))
        })
      });
      
      if (!cardsResponse.ok) {
        const errorData = await cardsResponse.json();
        throw new Error(errorData.message || 'Failed to create cards');
      }
      
      toast.success(`Set "${setTitle}" saved successfully!`);
      navigate(`/set/${setData.set.id}`);
      
    } catch (error) {
      console.error('Error saving set:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save set');
    } finally {
      setIsSaving(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Wand2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                AI Flashcard Generator
              </h1>
              <p className="text-muted-foreground">
                Upload your study materials and let AI create flashcards for you
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[
              { step: 'upload', label: 'Upload', icon: Upload },
              { step: 'configure', label: 'Configure', icon: Settings },
              { step: 'generate', label: 'Generate', icon: Wand2 },
              { step: 'review', label: 'Review', icon: CheckCircle },
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                  ${step === item.step 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : step === 'review' || (step === 'generate' && index < 2) || (step === 'configure' && index < 1)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted bg-background text-muted-foreground'
                  }
                `}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="ml-2 text-sm font-medium hidden sm:block">{item.label}</span>
                {index < 3 && (
                  <div className={`
                    w-8 h-0.5 mx-2 transition-colors
                    ${step === 'review' || (step === 'generate' && index < 2) || (step === 'configure' && index < 1)
                      ? 'bg-primary'
                      : 'bg-muted'
                    }
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Study Material
              </CardTitle>
              <CardDescription>
                Upload a PDF, DOCX, or TXT file containing the content you want to study
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                isProcessing={false}
              />
            </CardContent>
          </Card>
        )}

        {/* Step 2: Configure */}
        {step === 'configure' && parsedContent && (
          <div className="space-y-6">
            {/* File Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  File Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">File Name</p>
                    <p className="text-sm font-medium">{parsedContent.fileName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                    <Badge variant="secondary">{parsedContent.fileType.toUpperCase()}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Content Length</p>
                    <p className="text-sm font-medium">{parsedContent.text.length} characters</p>
                  </div>
                </div>
                {parsedContent.pageCount && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground">Pages</p>
                    <p className="text-sm font-medium">{parsedContent.pageCount}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Generation Settings
                </CardTitle>
                <CardDescription>
                  Customize how your flashcards will be generated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Number of Cards */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    Number of Flashcards: {cardCount[0]}
                  </label>
                  <Slider
                    value={cardCount}
                    onValueChange={setCardCount}
                    max={30}
                    min={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>5</span>
                    <span>30</span>
                  </div>
                </div>

                {/* Difficulty Level */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Difficulty Level
                  </label>
                  <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">Beginner</Badge>
                          <span className="text-sm">Basic concepts and simple definitions</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="intermediate">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-100 text-yellow-800">Intermediate</Badge>
                          <span className="text-sm">Balanced complexity</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="advanced">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-100 text-red-800">Advanced</Badge>
                          <span className="text-sm">Detailed concepts and technical terms</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep('upload')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="flex-1 gap-2"
                  >
                    {isLoading ? (
                      'Generating...'
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4" />
                        Generate Flashcards
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Generate */}
        {step === 'generate' && isLoading && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Wand2 className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Generating Flashcards</h3>
                  <p className="text-muted-foreground">AI is analyzing your content and creating flashcards...</p>
                </div>
                <Progress value={undefined} className="w-full max-w-md" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review */}
        {step === 'review' && generatedFlashcards && (
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Generation Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Generated</p>
                    <p className="text-2xl font-bold">{generatedFlashcards.flashcards.length} flashcards</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Selected</p>
                    <p className="text-2xl font-bold">{selectedCards.size} flashcards</p>
                  </div>
                </div>
                
                {generatedFlashcards.topics.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Key Topics Identified</p>
                    <div className="flex flex-wrap gap-2">
                      {generatedFlashcards.topics.map((topic, index) => (
                        <Badge key={index} variant="secondary">{topic}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {generatedFlashcards.summary && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Summary</p>
                    <p className="text-sm text-muted-foreground">{generatedFlashcards.summary}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selection Controls */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                Select flashcards to include in your set:
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                  Deselect All
                </Button>
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  Select All
                </Button>
              </div>
            </div>

            {/* Flashcards */}
            <div className="space-y-3">
              {generatedFlashcards.flashcards.map((card, index) => (
                <Card 
                  key={index} 
                  className={`
                    cursor-pointer transition-all hover:shadow-md
                    ${selectedCards.has(index) ? 'ring-2 ring-primary bg-primary/5' : ''}
                  `}
                  onClick={() => handleCardToggle(index)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-5 w-5 items-center justify-center mt-0.5">
                        <div className={`
                          h-4 w-4 rounded border-2 transition-colors
                          ${selectedCards.has(index) 
                            ? 'border-primary bg-primary' 
                            : 'border-muted-foreground'
                          }
                        `}>
                          {selectedCards.has(index) && (
                            <div className="h-full w-full flex items-center justify-center">
                              <div className="h-2 w-2 bg-primary-foreground rounded-full" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-foreground">{card.term}</h4>
                          <Badge className={getDifficultyColor(difficulty)} variant="secondary">
                            {difficulty}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <div className={`h-2 w-2 rounded-full ${getConfidenceColor(card.confidence)}`} />
                            <span className="text-xs text-muted-foreground">
                              {Math.round(card.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{card.definition}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('configure')}
                className="flex-1"
              >
                Back to Configure
              </Button>
              <Button
                onClick={handleCreateSet}
                disabled={selectedCards.size === 0}
                className="flex-1 gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Create Study Set ({selectedCards.size} cards)
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Save Set */}
        {step === 'save' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Save Your Flashcard Set
                </CardTitle>
                <CardDescription>
                  Customize your set details and choose visibility settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Set Title *</Label>
                  <Input
                    id="title"
                    value={setTitle}
                    onChange={(e) => setSetTitle(e.target.value)}
                    placeholder="Enter a title for your flashcard set"
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    {setTitle.length}/100 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={setDescription}
                    onChange={(e) => setSetDescription(e.target.value)}
                    placeholder="Describe what this set is about (optional)"
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {setDescription.length}/500 characters
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Visibility</Label>
                  <RadioGroup value={isPublic ? 'public' : 'private'} onValueChange={(value) => setIsPublic(value === 'public')}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="private" />
                      <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
                        <Lock className="h-4 w-4" />
                        <div>
                          <p className="font-medium">Private</p>
                          <p className="text-sm text-muted-foreground">Only you can see and study this set</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="public" />
                      <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer">
                        <Globe className="h-4 w-4" />
                        <div>
                          <p className="font-medium">Public</p>
                          <p className="text-sm text-muted-foreground">Anyone can find and study this set</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Set Summary</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• {selectedCards.size} flashcards selected</p>
                    <p>• {difficulty} difficulty level</p>
                    <p>• Generated from: {parsedContent?.fileName || 'uploaded file'}</p>
                    <p>• {isPublic ? 'Public - visible to everyone' : 'Private - visible only to you'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('review')}
                className="flex-1"
                disabled={isSaving}
              >
                Back to Review
              </Button>
              <Button
                onClick={handleSaveSet}
                disabled={!setTitle.trim() || isSaving}
                className="flex-1 gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Set ({selectedCards.size} cards)
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
