'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle2,
  Lightbulb,
  Target,
  Zap,
  Users,
  MessageCircle,
  Upload,
  Eye,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  type: 'tooltip' | 'modal' | 'spotlight' | 'interactive';
  action?: 'click' | 'hover' | 'type' | 'upload' | 'wait';
  expectedValue?: string;
  nextTrigger?: 'auto' | 'manual' | 'completion';
  tips?: string[];
  videoUrl?: string;
  interactive?: boolean;
  skipAllowed?: boolean;
}

interface Tutorial {
  id: string;
  name: string;
  description: string;
  category: 'getting-started' | 'advanced' | 'tips' | 'features';
  estimatedTime: number; // in minutes
  steps: TutorialStep[];
  prerequisite?: string[];
  icon: any;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const TUTORIALS: Tutorial[] = [
  {
    id: 'first-upload',
    name: 'Upload Your First Conversation',
    description: 'Learn how to upload and process your WhatsApp conversations',
    category: 'getting-started',
    estimatedTime: 3,
    difficulty: 'beginner',
    icon: Upload,
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Talkers! 👋',
        description: 'Let\'s get your first conversation uploaded and ready for chatting. This will take about 3 minutes.',
        target: 'body',
        position: 'center',
        type: 'modal',
        nextTrigger: 'manual'
      },
      {
        id: 'export-guide',
        title: 'Export Your WhatsApp Chat',
        description: 'First, you need to export a chat from WhatsApp. Here\'s how to do it on your phone.',
        target: '.upload-area',
        position: 'bottom',
        type: 'tooltip',
        tips: [
          'Open WhatsApp and find the conversation you want to preserve',
          'Tap the contact/group name at the top',
          'Select "Export Chat" and choose "Without Media"',
          'Save the file to your phone'
        ],
        nextTrigger: 'manual'
      },
      {
        id: 'upload-file',
        title: 'Upload Your File',
        description: 'Now drag and drop your exported chat file here, or click to browse.',
        target: '.upload-dropzone',
        position: 'top',
        type: 'spotlight',
        action: 'upload',
        interactive: true,
        nextTrigger: 'completion'
      },
      {
        id: 'processing',
        title: 'AI is Learning Their Voice',
        description: 'Our AI is analyzing the conversation patterns to understand their unique personality and communication style.',
        target: '.processing-indicator',
        position: 'right',
        type: 'tooltip',
        action: 'wait',
        nextTrigger: 'auto'
      },
      {
        id: 'first-chat',
        title: 'Start Your First Conversation!',
        description: 'Perfect! Now you can chat with their memory. Try saying "Hello" or asking how they\'re doing.',
        target: '.chat-input',
        position: 'top',
        type: 'tooltip',
        action: 'type',
        expectedValue: 'hello',
        interactive: true,
        nextTrigger: 'completion'
      }
    ]
  },
  {
    id: 'advanced-features',
    name: 'Explore Advanced Features',
    description: 'Discover memory timelines, personality insights, and conversation modes',
    category: 'features',
    estimatedTime: 5,
    difficulty: 'intermediate',
    icon: Sparkles,
    prerequisite: ['first-upload'],
    steps: [
      {
        id: 'timeline-intro',
        title: 'Memory Timeline',
        description: 'Create a timeline of special moments, birthdays, and memories that matter to you both.',
        target: '.timeline-tab',
        position: 'bottom',
        type: 'tooltip',
        action: 'click',
        nextTrigger: 'completion'
      },
      {
        id: 'add-milestone',
        title: 'Add Your First Memory',
        description: 'Click here to add a special date or memory to your timeline.',
        target: '.add-milestone-btn',
        position: 'left',
        type: 'spotlight',
        action: 'click',
        interactive: true,
        nextTrigger: 'completion'
      },
      {
        id: 'personality-insights',
        title: 'Personality Insights',
        description: 'See how our AI has learned their communication style and favorite topics.',
        target: '.personality-panel',
        position: 'right',
        type: 'tooltip',
        nextTrigger: 'manual'
      },
      {
        id: 'conversation-modes',
        title: 'Conversation Modes',
        description: 'Switch between casual, deep, playful, or supportive conversation modes based on your mood.',
        target: '.context-modes',
        position: 'bottom',
        type: 'tooltip',
        action: 'click',
        nextTrigger: 'completion'
      }
    ]
  },
  {
    id: 'sharing-features',
    name: 'Family Sharing & Collaboration',
    description: 'Learn how to share memories with family members and collaborate on timelines',
    category: 'advanced',
    estimatedTime: 4,
    difficulty: 'advanced',
    icon: Users,
    prerequisite: ['first-upload', 'advanced-features'],
    steps: [
      {
        id: 'sharing-intro',
        title: 'Share with Family',
        description: 'Invite family members to contribute memories and chat with your shared loved one.',
        target: '.share-button',
        position: 'bottom',
        type: 'tooltip',
        nextTrigger: 'manual'
      },
      {
        id: 'privacy-controls',
        title: 'Privacy Settings',
        description: 'Control what memories are private vs. shared with your family circle.',
        target: '.privacy-settings',
        position: 'left',
        type: 'tooltip',
        nextTrigger: 'manual'
      }
    ]
  }
];

interface SmartTutorialProps {
  onComplete?: (tutorialId: string) => void;
  onSkip?: (tutorialId: string) => void;
  activeTutorial?: string;
  autoStart?: boolean;
}

export function SmartTutorialSystem({ 
  onComplete, 
  onSkip, 
  activeTutorial,
  autoStart = false 
}: SmartTutorialProps) {
  const [currentTutorial, setCurrentTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTutorialList, setShowTutorialList] = useState(false);
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});
  const overlayRef = useRef<HTMLDivElement>(null);
  const [highlightElement, setHighlightElement] = useState<Element | null>(null);

  // Load completed tutorials and progress
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
    const progress = JSON.parse(localStorage.getItem('tutorialProgress') || '{}');
    setCompletedTutorials(completed);
    setUserProgress(progress);

    // Auto-start first tutorial for new users
    if (autoStart && completed.length === 0) {
      startTutorial('first-upload');
    }
  }, [autoStart]);

  // Handle active tutorial prop
  useEffect(() => {
    if (activeTutorial) {
      startTutorial(activeTutorial);
    }
  }, [activeTutorial]);

  const startTutorial = (tutorialId: string) => {
    const tutorial = TUTORIALS.find(t => t.id === tutorialId);
    if (!tutorial) return;

    // Check prerequisites
    const hasPrerequisites = tutorial.prerequisite?.every(req => 
      completedTutorials.includes(req)
    ) ?? true;

    if (!hasPrerequisites) {
      alert('Please complete the required tutorials first.');
      return;
    }

    setCurrentTutorial(tutorial);
    setCurrentStep(0);
    setIsActive(true);
    setIsPlaying(true);
    
    // Highlight target element
    highlightTarget(tutorial.steps[0]);
  };

  const highlightTarget = (step: TutorialStep) => {
    if (step.target === 'body') {
      setHighlightElement(null);
      return;
    }

    const element = document.querySelector(step.target);
    if (element) {
      setHighlightElement(element);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const nextStep = () => {
    if (!currentTutorial) return;

    if (currentStep < currentTutorial.steps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      highlightTarget(currentTutorial.steps[nextStepIndex]);
      
      // Save progress
      const newProgress = { ...userProgress };
      newProgress[currentTutorial.id] = nextStepIndex;
      setUserProgress(newProgress);
      localStorage.setItem('tutorialProgress', JSON.stringify(newProgress));
    } else {
      completeTutorial();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);
      if (currentTutorial) {
        highlightTarget(currentTutorial.steps[prevStepIndex]);
      }
    }
  };

  const completeTutorial = () => {
    if (!currentTutorial) return;

    const newCompleted = [...completedTutorials, currentTutorial.id];
    setCompletedTutorials(newCompleted);
    localStorage.setItem('completedTutorials', JSON.stringify(newCompleted));

    // Clear progress
    const newProgress = { ...userProgress };
    delete newProgress[currentTutorial.id];
    setUserProgress(newProgress);
    localStorage.setItem('tutorialProgress', JSON.stringify(newProgress));

    setIsActive(false);
    setHighlightElement(null);
    onComplete?.(currentTutorial.id);

    // Auto-suggest next tutorial
    suggestNextTutorial();
  };

  const skipTutorial = () => {
    if (!currentTutorial) return;
    
    setIsActive(false);
    setHighlightElement(null);
    onSkip?.(currentTutorial.id);
  };

  const suggestNextTutorial = () => {
    const availableTutorials = TUTORIALS.filter(tutorial => {
      const hasPrerequisites = tutorial.prerequisite?.every(req => 
        completedTutorials.includes(req)
      ) ?? true;
      return !completedTutorials.includes(tutorial.id) && hasPrerequisites;
    });

    if (availableTutorials.length > 0) {
      // Show suggestion modal
      setTimeout(() => {
        setShowTutorialList(true);
      }, 1000);
    }
  };

  const getAvailableTutorials = () => {
    return TUTORIALS.filter(tutorial => {
      const hasPrerequisites = tutorial.prerequisite?.every(req => 
        completedTutorials.includes(req)
      ) ?? true;
      return hasPrerequisites;
    });
  };

  if (!isActive && !showTutorialList) {
    return (
      <Button
        onClick={() => setShowTutorialList(true)}
        className="fixed bottom-4 right-4 z-40 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        <Lightbulb className="w-4 h-4 mr-2" />
        Tutorials
      </Button>
    );
  }

  const currentStepData = currentTutorial?.steps[currentStep];

  return (
    <>
      {/* Tutorial List Modal */}
      <AnimatePresence>
        {showTutorialList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Interactive Tutorials</h2>
                    <p className="text-gray-600">Learn to get the most out of Talkers</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTutorialList(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {getAvailableTutorials().map(tutorial => {
                  const Icon = tutorial.icon;
                  const isCompleted = completedTutorials.includes(tutorial.id);
                  const progress = userProgress[tutorial.id] || 0;
                  const progressPercent = (progress / tutorial.steps.length) * 100;

                  return (
                    <Card 
                      key={tutorial.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isCompleted ? 'bg-green-50 border-green-200' : 'hover:border-purple-300'
                      }`}
                      onClick={() => {
                        setShowTutorialList(false);
                        startTutorial(tutorial.id);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${
                            isCompleted ? 'bg-green-100' : 'bg-purple-100'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-6 h-6 text-green-600" />
                            ) : (
                              <Icon className="w-6 h-6 text-purple-600" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{tutorial.name}</h3>
                              <Badge variant={
                                tutorial.difficulty === 'beginner' ? 'secondary' :
                                tutorial.difficulty === 'intermediate' ? 'default' : 'destructive'
                              }>
                                {tutorial.difficulty}
                              </Badge>
                              {isCompleted && (
                                <Badge className="bg-green-100 text-green-800">
                                  Completed
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">{tutorial.description}</p>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>⏱️ {tutorial.estimatedTime} min</span>
                              <span>📚 {tutorial.steps.length} steps</span>
                              {progress > 0 && !isCompleted && (
                                <span>🔄 {Math.round(progressPercent)}% complete</span>
                              )}
                            </div>

                            {progress > 0 && !isCompleted && (
                              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-purple-600 h-2 rounded-full transition-all"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            )}
                          </div>
                          
                          <Button size="sm" variant={isCompleted ? 'outline' : 'default'}>
                            {isCompleted ? 'Review' : progress > 0 ? 'Continue' : 'Start'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Tutorial Overlay */}
      <AnimatePresence>
        {isActive && currentTutorial && currentStepData && (
          <>
            {/* Overlay */}
            <motion.div
              ref={overlayRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 pointer-events-none"
            >
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/60" />
              
              {/* Spotlight */}
              {highlightElement && (
                <div 
                  className="absolute bg-white rounded-lg"
                  style={{
                    left: highlightElement.getBoundingClientRect().left - 8,
                    top: highlightElement.getBoundingClientRect().top - 8,
                    width: highlightElement.getBoundingClientRect().width + 16,
                    height: highlightElement.getBoundingClientRect().height + 16,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                  }}
                />
              )}
            </motion.div>

            {/* Tutorial Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed z-50 pointer-events-auto"
              style={{
                left: currentStepData.type === 'modal' ? '50%' : 
                  highlightElement ? highlightElement.getBoundingClientRect().right + 20 : '50%',
                top: currentStepData.type === 'modal' ? '50%' : 
                  highlightElement ? highlightElement.getBoundingClientRect().top : '50%',
                transform: currentStepData.type === 'modal' ? 'translate(-50%, -50%)' : 'none',
              }}
            >
              <Card className="max-w-sm shadow-2xl border-2 border-purple-200">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {currentStep + 1}
                      </div>
                      <span className="text-sm text-gray-500">
                        {currentStep + 1} of {currentTutorial.steps.length}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={skipTutorial}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {currentStepData.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {currentStepData.description}
                    </p>

                    {/* Tips */}
                    {currentStepData.tips && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="text-xs font-medium text-blue-900 mb-2">💡 Tips:</div>
                        <ul className="text-xs text-blue-800 space-y-1">
                          {currentStepData.tips.map((tip, index) => (
                            <li key={index}>• {tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${((currentStep + 1) / currentTutorial.steps.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={previousStep}
                      disabled={currentStep === 0}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={nextStep}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        {currentStep === currentTutorial.steps.length - 1 ? 'Finish' : 'Next'}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}