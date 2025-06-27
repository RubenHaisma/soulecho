'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Upload, FileText, User, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';

interface ParsedData {
  totalMessages: number;
  dateRange: string;
  participants: string[];
  preview: string[];
  successRate?: number;
  skippedSystemMessages?: number;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [totalMessages, setTotalMessages] = useState(0);
  const [processedMessages, setProcessedMessages] = useState(0);
  const [canStartChatting, setCanStartChatting] = useState(false);
  const [chatReadyProgress, setChatReadyProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [selectedPerson, setSelectedPerson] = useState('');
  const [personName, setPersonName] = useState('');
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');
  const router = useRouter();
  const session = useSession() as { data: (Session & { user: { id?: string; sub?: string; name?: string | null; email?: string | null; image?: string | null } }) | null, status: string };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.txt')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select a .txt file (WhatsApp chat export)');
      }
    }
  }, []);

  const parseWhatsAppFile = async (file: File): Promise<ParsedData> => {
    const text = await file.text();
    
    // Validate file content first
    if (!text || text.trim().length === 0) {
      throw new Error('File appears to be empty. Please select a valid WhatsApp chat export.');
    }
    
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    
    if (lines.length < 5) {
      throw new Error('File seems too short to be a WhatsApp export. Please ensure you exported the full chat history.');
    }
    
    // Multiple patterns to handle different WhatsApp export formats
    const patterns = [
      /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}), (\d{1,2}:\d{2}:\d{2})\s?([AP]?M?)\]\s*([^:]+):\s*(.+)$/,
      /^\[(\d{1,2}\/\d{1,2}\/\d{2}), (\d{1,2}:\d{2}:\d{2})\s([AP]M)\]\s*([^:]+):\s*(.+)$/,
      /^(\d{1,2}\/\d{1,2}\/\d{4}), (\d{1,2}:\d{2})\s?-\s*([^:]+):\s*(.+)$/,
      /^\[(\d{1,2}\.\d{1,2}\.\d{2,4}), (\d{1,2}:\d{2}:\d{2})\]\s*([^:]+):\s*(.+)$/
    ];
    
    const systemMessages = [
      '<Media omitted>', 'image omitted', 'video omitted', 'audio omitted',
      'Messages and calls are end-to-end encrypted', 'This message was deleted',
      'document omitted', 'GIF omitted', 'sticker omitted', 'Contact card omitted'
    ];
    
    const messages: { sender: string; content: string; date: string; timestamp: string }[] = [];
    const participants = new Set<string>();
    let successCount = 0;
    let skippedSystemMessages = 0;
    
    lines.forEach((line, index) => {
      let match = null;
      let patternUsed = -1;
      
      // Try each pattern
      for (let i = 0; i < patterns.length; i++) {
        match = line.match(patterns[i]);
        if (match) {
          patternUsed = i;
          break;
        }
      }
      
      if (match) {
        let sender: string;
        let content: string;
        let dateStr: string;
        let timeStr: string;
        
        // Extract based on pattern
        switch (patternUsed) {
          case 0: // [DD/MM/YYYY, HH:MM:SS] format
            [, dateStr, timeStr, , sender, content] = match;
            break;
          case 1: // [DD/MM/YY, HH:MM:SS AM/PM] format
            [, dateStr, timeStr, , sender, content] = match;
            break;
          case 2: // DD/MM/YYYY, HH:MM - format
            [, dateStr, timeStr, sender, content] = match;
            break;
          case 3: // [DD.MM.YY, HH:MM:SS] format
            [, dateStr, timeStr, sender, content] = match;
            dateStr = dateStr.replace(/\./g, '/');
            break;
          default:
            return;
        }
        
        const cleanSender = sender.trim();
        const cleanContent = content.trim();
        
        // Check if it's a system message
        const isSystemMessage = systemMessages.some(sysMsg => 
          cleanContent.toLowerCase().includes(sysMsg.toLowerCase())
        );
        
        if (isSystemMessage) {
          skippedSystemMessages++;
          return;
        }
        
        if (cleanContent.length > 2) { // Filter out very short messages
          participants.add(cleanSender);
          messages.push({ 
            sender: cleanSender, 
            content: cleanContent, 
            date: dateStr,
            timestamp: `${dateStr}, ${timeStr}`
          });
          successCount++;
        }
      }
    });

    if (messages.length === 0) {
      throw new Error(`No valid WhatsApp messages found. 
        
Parsed ${lines.length} lines but found no valid messages.
        
Please ensure you:
• Exported as "Without Media" from WhatsApp
• Selected the complete chat history
• File contains lines like: [DD/MM/YYYY, HH:MM:SS] Name: Message
        
Supported formats:
• [25/12/2023, 14:30:22] John: Hello world
• 25/12/2023, 14:30 - John: Hello world
• [25.12.23, 14:30:22] John: Hello world`);
    }

    // Sort messages chronologically
    messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    const dateRange = messages.length > 0 ? 
      `${messages[0].date} - ${messages[messages.length - 1].date}` : 
      'Unknown';
      
    const successRate = Math.round((successCount / lines.length) * 100);

    return {
      totalMessages: messages.length,
      dateRange,
      participants: Array.from(participants).sort(),
      preview: messages
        .filter(m => m.content.length > 15) // Better previews with longer messages
        .slice(0, 5)
        .map(m => `${m.sender}: ${m.content.substring(0, 80)}${m.content.length > 80 ? '...' : ''}`),
      successRate,
      skippedSystemMessages
    };
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError('');

    try {
      // Parse the file
      setProgress(25);
      const parsed = await parseWhatsAppFile(file);
      setParsedData(parsed);
      setProgress(50);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(100);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process the file');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!file || !selectedPerson || !personName.trim()) {
      setError('Please complete all fields');
      return;
    }

    if (!((session.data?.user as any)?.id || (session.data?.user as any)?.sub)) {
      setError('Please sign in to create a session');
      return;
    }

    setUploading(true);
    setProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('selectedPerson', selectedPerson);
      formData.append('personName', personName.trim());
      formData.append('userId', (session.data?.user as any)?.id || (session.data?.user as any)?.sub);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create session');
      }

      const data = await response.json();
      console.log('Upload response:', data); // Debug log
      
      // Connect to real-time progress stream
      if (data.uploadId && data.sessionId) {
        const progressUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/progress/${data.uploadId}`;
        console.log('Connecting to progress stream:', progressUrl); // Debug log
        
        const eventSource = new EventSource(progressUrl);
        
        eventSource.onopen = () => {
          console.log('Progress stream connected'); // Debug log
        };
        
        eventSource.onmessage = (event) => {
          try {
            const progressData = JSON.parse(event.data);
            console.log('Progress update:', progressData); // Debug log
            setProgress(progressData.progress);
            setProgressMessage(progressData.message || '');
            setTotalMessages(progressData.total || 0);
            setProcessedMessages(progressData.processed || 0);
            
            // Calculate chat readiness (can start chatting when 10% of messages are processed or minimum 100 messages)
            const total = progressData.total || 0;
            const processed = progressData.processed || 0;
            const minMessagesForChat = Math.min(Math.max(Math.floor(total * 0.1), 100), 500); // 10% or 100-500 messages
            const chatReady = processed >= minMessagesForChat && progressData.stage === 'analyzing';
            const chatProgressPercent = total > 0 ? Math.min((processed / minMessagesForChat) * 100, 100) : 0;
            
            setCanStartChatting(chatReady);
            setChatReadyProgress(chatProgressPercent);
            
            // Handle different stages
            if (progressData.stage === 'complete') {
              setCanStartChatting(true);
              setChatReadyProgress(100);
              eventSource.close();
              setSessionId(data.sessionId);
              // Keep uploading state true until we redirect
              setTimeout(() => {
                setUploading(false);
                router.push(`/chat/${data.sessionId}`);
              }, 2000); // Give user time to see completion
            } else if (progressData.stage === 'error') {
              eventSource.close();
              setError(progressData.message || 'Processing failed');
              setUploading(false);
            }
          } catch (e) {
            console.warn('Failed to parse progress data:', e);
          }
        };
        
        eventSource.onerror = (error) => {
          console.warn('Progress stream error:', error);
          console.log('EventSource readyState:', eventSource.readyState); // Debug log
          eventSource.close();
          setError('Connection to processing server lost. Please try again.');
          setUploading(false);
        };
        
        // Cleanup function for component unmount
        const cleanup = () => eventSource.close();
        
        // Store cleanup function
        window.addEventListener('beforeunload', cleanup);
        
        return cleanup;
      } else {
        setError('Failed to start processing. Please try again.');
        setUploading(false);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chat session');
      setUploading(false); // Only set to false on error
    }
    // Don't set uploading to false in finally - let the progress stream handle it
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-purple-50/30 to-blue-50/20">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="rounded-full bg-white/50 backdrop-blur-sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Upload Your Chat</h1>
            <p className="text-gray-600 mt-1">Share your WhatsApp conversation to begin</p>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8">
          {/* Step 1: File Upload */}
          <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                Upload WhatsApp Chat File
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <div className="space-y-2">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-lg font-medium text-gray-700">
                      Choose your WhatsApp chat export file
                    </span>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </Label>
                  <p className="text-sm text-gray-500">
                    Only .txt files from WhatsApp export are supported
                  </p>
                </div>
              </div>

              {file && (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">{file.name}</span>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              )}

              {file && !parsedData && (
                <Button 
                  onClick={handleUpload} 
                  disabled={uploading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {uploading ? 'Processing...' : 'Process File'}
                </Button>
              )}

                            {uploading && (
                <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                  {/* Main Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {progressMessage || 
                         (progress < 25 ? 'Reading file...' : 
                          progress < 50 ? 'Parsing messages...' : 
                          progress < 75 ? 'Analyzing conversation...' : 
                           'Finalizing...')}
                      </span>
                      <span className="text-sm font-medium text-purple-600">{Math.round(progress)}%</span>
                    </div>
                    <div className="relative">
                      <Progress value={progress} className="h-3 bg-gray-200" />
                      <div className="absolute inset-0 h-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse" />
                    </div>
                  </div>

                  {/* Chat Readiness Indicator */}
                  {totalMessages > 0 && (
                    <div className="space-y-2 p-3 bg-white/60 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${canStartChatting ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
                          <span className="text-sm font-medium text-gray-700">
                            {canStartChatting ? `Ready to start chatting with ${personName || 'your person'}!` : `Preparing chat with ${personName || 'your person'}...`}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{Math.round(chatReadyProgress)}%</span>
                      </div>
                      <div className="relative">
                        <Progress value={chatReadyProgress} className="h-2" />
                        <div className={`absolute inset-0 h-2 rounded-full ${canStartChatting ? 'bg-green-400' : 'bg-orange-400'} opacity-30`} />
                      </div>
                      <p className="text-xs text-gray-600">
                        {canStartChatting 
                          ? `${personName || 'They'} have enough memories to chat meaningfully with you!`
                          : `Processing memories... (${processedMessages.toLocaleString()} analyzed)`
                        }
                      </p>
                    </div>
                  )}

                  {/* Start Chatting Button */}
                  {canStartChatting && sessionId && (
                    <div className="pt-2">
                      <Button
                        onClick={() => router.push(`/chat/${sessionId}`)}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105"
                      >
                        🎉 Start Chatting with {personName || 'your person'}
                      </Button>
                      <p className="text-xs text-center text-gray-500 mt-2">
                        You can start now! Processing will continue in the background.
                      </p>
                    </div>
                  )}

                  {/* Stage Indicators */}
                  <div className="flex justify-between items-center text-xs">
                    <div className={`flex items-center gap-1 transition-colors ${progress >= 25 ? 'text-green-600' : 'text-gray-400'}`}>
                      {progress >= 25 ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <div className="w-3 h-3 border-2 border-current rounded-full animate-spin" />
                      )}
                      <span>File Reading</span>
                    </div>
                    <div className={`flex items-center gap-1 transition-colors ${progress >= 50 ? 'text-green-600' : progress >= 25 ? 'text-blue-600' : 'text-gray-400'}`}>
                      {progress >= 50 ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : progress >= 25 ? (
                        <div className="w-3 h-3 border-2 border-current rounded-full animate-spin" />
                      ) : (
                        <div className="w-3 h-3 border-2 border-gray-300 rounded-full" />
                      )}
                      <span>Message Parsing</span>
                    </div>
                    <div className={`flex items-center gap-1 transition-colors ${progress >= 75 ? 'text-green-600' : progress >= 50 ? 'text-purple-600' : 'text-gray-400'}`}>
                      {progress >= 75 ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : progress >= 50 ? (
                        <div className="w-3 h-3 border-2 border-current rounded-full animate-spin" />
                      ) : (
                        <div className="w-3 h-3 border-2 border-gray-300 rounded-full" />
                      )}
                      <span>Analysis</span>
                    </div>
                    <div className={`flex items-center gap-1 transition-colors ${progress >= 100 ? 'text-green-600' : progress >= 75 ? 'text-pink-600' : 'text-gray-400'}`}>
                      {progress >= 100 ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : progress >= 75 ? (
                        <div className="w-3 h-3 border-2 border-current rounded-full animate-spin" />
                      ) : (
                        <div className="w-3 h-3 border-2 border-gray-300 rounded-full" />
                      )}
                      <span>Complete</span>
                    </div>
                  </div>

                  {/* Processing Details */}
                  <div className="text-center space-y-1">
                    <p className="text-sm text-gray-600">
                      {progressMessage || 
                       (progress < 25 ? 'Reading and validating your chat file...' : 
                        progress < 50 ? 'Extracting messages and timestamps...' : 
                        progress < 75 ? 'Understanding conversation patterns and context...' : 
                        progress < 100 ? 'Preparing your personalized chat experience...' :
                        'Ready to chat!')}
                    </p>
                    {processedMessages > 0 && totalMessages > 0 && (
                      <p className="text-xs text-purple-600 font-medium">
                        {processedMessages.toLocaleString()} / {totalMessages.toLocaleString()} messages 
                        ({Math.round((processedMessages / totalMessages) * 100)}%)
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Review and Configure */}
          {parsedData && (
            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    2
                  </div>
                  Configure Your Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Chat Summary */}
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Messages Found</h4>
                    <p className="text-2xl font-bold text-purple-600">{parsedData.totalMessages}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Date Range</h4>
                    <p className="text-sm text-gray-600">{parsedData.dateRange}</p>
                  </div>
                </div>

                {/* Person Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Who would you like to talk to?</Label>
                  <div className="grid gap-2">
                    {parsedData.participants.map((participant, index) => (
                      <label key={index} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="person"
                          value={participant}
                          checked={selectedPerson === participant}
                          onChange={(e) => setSelectedPerson(e.target.value)}
                          className="text-purple-600"
                        />
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="font-medium">{participant}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Person Name */}
                {selectedPerson && (
                  <div className="space-y-2">
                    <Label htmlFor="person-name" className="text-base font-medium">
                      What name would you like to use for them in the chat?
                    </Label>
                    <Input
                      id="person-name"
                      placeholder="e.g., Mom, Dad, Sarah, etc."
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      className="bg-white/50"
                    />
                  </div>
                )}

                {/* Message Preview */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">Message Preview</Label>
                  <div className="bg-white rounded-lg border p-4 max-h-48 overflow-y-auto">
                    {parsedData.preview.map((message, index) => (
                      <p key={index} className="text-sm text-gray-700 mb-2 last:mb-0">
                        {message}
                      </p>
                    ))}
                  </div>
                </div>

                {selectedPerson && personName.trim() && (
                  <Button 
                    onClick={handleCreateSession}
                    disabled={uploading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg py-3"
                  >
                    {uploading ? 'Creating Session...' : `Start Chatting with ${personName}`}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Instructions */}
        <Card className="mt-8 border-0 bg-blue-50/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-800 mb-3">How to export your WhatsApp chat:</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>iPhone:</strong> Open chat → Tap contact name → Export Chat → Without Media</p>
              <p><strong>Android:</strong> Open chat → Menu (⋮) → More → Export chat → Without media</p>
              <p className="text-xs text-gray-500 mt-3">
                Your data is processed securely and deleted after your session ends.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}