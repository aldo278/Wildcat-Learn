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
  GraduationCap,
  Sparkles,
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
  const [inputMode, setInputMode] = useState<'file' | 'text' | 'url'>('file');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedContent, setParsedContent] = useState<ParsedContent | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [pastedUrl, setPastedUrl] = useState('');
  const [cardCount, setCardCount] = useState([10]);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  
  // Save form states
  const [setTitle, setSetTitle] = useState('');
  const [setDescription, setSetDescription] = useState('');
  const [setClassName, setSetClassName] = useState('');
  const [setClassSubject, setSetClassSubject] = useState('');
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
      const setResponse = await fetch('http://localhost:5555/api/sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: setTitle.trim(),
          description: setDescription.trim(),
          className: setClassName.trim() || undefined,
          classSubject: setClassSubject.trim() || undefined,
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

      const cardsResponse = await fetch('http://localhost:5555/api/cards/batch', {
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
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-12 flex items-center justify-center min-h-[400px]">
          <div className="max-w-4xl text-center w-full">
            <div className="flex items-center justify-center gap-2 mb-4">
              <GraduationCap className="h-8 w-8 text-yellow-400" />
              <span className="bg-yellow-400 text-purple-900 px-3 py-1 rounded-full text-sm font-bold">
                Powered by Gemini AI 
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              <span className="text-yellow-400">AI</span> Flashcard Generator
            </h1>
            <p className="text-lg md:text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Upload your notes or paste lecture notes. AI will turn it to a ready-to-study set in seconds
            </p>
            
            {/* How-it-works Pills */}
            <div className="flex justify-center items-center gap-2 md:gap-4">
              {['Upload', 'Configure', 'Generate', 'Review'].map((step, index) => (
                <div key={step} className="flex items-center gap-2 md:gap-4">
                  <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-white/20 border-2 border-white text-white rounded-full font-bold text-sm md:text-lg">
                    {index + 1}
                  </div>
                  <span className="text-white text-sm md:text-base font-medium hidden sm:block">
                    {step}
                  </span>
                  {index < 3 && (
                    <ArrowRight className="h-4 w-4 md:h-5 md:w-5 text-white/60" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
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

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="space-y-6">
            {/* Input Mode Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {[
                { mode: 'file' as const, label: 'Upload', icon: Upload },
                { mode: 'text' as const, label: 'Paste text', icon: FileText },
                { mode: 'url' as const, label: 'Paste URL', icon: Globe }
              ].map((tab) => (
                <button
                  key={tab.mode}
                  onClick={() => setInputMode(tab.mode)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    inputMode === tab.mode
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Upload Content */}
            <Card>
              <CardContent className="p-6">
                {inputMode === 'file' && (
                  <div className="space-y-4">
                    {/* Redesigned Drop Zone */}
                    <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center bg-purple-50/50 hover:bg-purple-50 transition-colors">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="h-8 w-8 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Choose your study material
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Drag and drop your file here, or click to browse
                      </p>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        Browse files
                      </Button>
                      <div className="flex justify-center gap-2 mt-4">
                        {['PDF', 'DOCX', 'TXT'].map((format) => (
                          <span key={format} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                            {format}
                          </span>
                        ))}
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                          10 MB max
                        </span>
                      </div>
                    </div>
                    <FileUpload
                      onFileSelect={handleFileSelect}
                      onFileRemove={handleFileRemove}
                      isProcessing={false}
                    />
                  </div>
                )}

                {inputMode === 'text' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="pasted-text" className="text-sm font-medium text-gray-900">
                        Paste your study material
                      </Label>
                      <Textarea
                        id="pasted-text"
                        placeholder="Paste your lecture notes, textbook content, or study material here..."
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                        className="mt-2 min-h-[200px]"
                      />
                    </div>
                    <Button 
                      onClick={() => {
                        if (pastedText.trim()) {
                          setParsedContent({ text: pastedText, fileName: 'Pasted Text', fileType: 'txt' });
                          setStep('configure');
                          toast.success('Text added successfully!');
                        } else {
                          toast.error('Please enter some text');
                        }
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      Continue to Configuration
                    </Button>
                  </div>
                )}

                {inputMode === 'url' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="pasted-url" className="text-sm font-medium text-gray-900">
                        Enter the URL of your study material
                      </Label>
                      <Input
                        id="pasted-url"
                        type="url"
                        placeholder="https://canvas.linfield.edu/courses/123/pages/lecture-notes"
                        value={pastedUrl}
                        onChange={(e) => setPastedUrl(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <Button 
                      onClick={() => {
                        if (pastedUrl.trim()) {
                          // TODO: Implement URL fetching
                          toast.info('URL support coming soon!');
                        } else {
                          toast.error('Please enter a URL');
                        }
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      Fetch Content
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tip Box */}
            <Alert className="border-yellow-200 bg-yellow-50">
              <Lightbulb className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Pro tip:</strong> Lecture notes with clear headings work best. Structured content with bullet points, numbered lists, or bold terms will generate better flashcards. Scanned images or handwritten notes won't work properly.
              </AlertDescription>
            </Alert>
          </div>
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

            {/* Course & Set Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course & Set Information
                </CardTitle>
                <CardDescription>
                  Add context to organize your flashcards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="course-code">Course Code</Label>
                    <Input
                      id="course-code"
                      placeholder="e.g., SOAN 111"
                      value={setClassName}
                      onChange={(e) => setSetClassName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="set-name">Set Name</Label>
                    <Input
                      id="set-name"
                      placeholder="e.g., Social Science Terms"
                      value={setTitle}
                      onChange={(e) => setSetTitle(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Social Science"
                    value={setClassSubject}
                    onChange={(e) => setSetClassSubject(e.target.value)}
                    className="mt-1"
                  />
                </div>
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
                {/* Visual Card Count Selector */}
                <div>
                  <Label className="text-sm font-medium text-foreground mb-3 block">
                    Number of Flashcards
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { count: 10, label: '10', recommended: true },
                      { count: 20, label: '20', recommended: false },
                      { count: 40, label: '40', recommended: false },
                      { count: 0, label: 'Custom', recommended: false }
                    ].map((option) => (
                      <button
                        key={option.label}
                        onClick={() => {
                          if (option.count === 0) {
                            // TODO: Implement custom input
                            toast.info('Custom count coming soon!');
                          } else {
                            setCardCount([option.count]);
                          }
                        }}
                        className={`p-3 rounded-lg border-2 text-center transition-colors ${
                          cardCount[0] === option.count && option.count !== 0
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-lg font-bold">{option.label}</div>
                        {option.recommended && (
                          <div className="text-xs text-purple-600 font-medium">Recommended</div>
                        )}
                      </button>
                    ))}
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
                <div className="space-y-3 pt-4">
                  <div className="flex gap-3">
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
                  <p className="text-center text-sm text-gray-500">
                    Takes about 10–20 seconds
                  </p>
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="className">Class Name <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input
                      id="className"
                      value={setClassName}
                      onChange={(e) => setSetClassName(e.target.value)}
                      placeholder='e.g. "BIOL 201"'
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="classSubject">Class Subject <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input
                      id="classSubject"
                      value={setClassSubject}
                      onChange={(e) => setSetClassSubject(e.target.value)}
                      placeholder='e.g. "Science"'
                    />
                  </div>
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
