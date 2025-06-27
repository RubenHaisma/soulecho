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

interface ParsedData {
  totalMessages: number;
  dateRange: string;
  participants: string[];
  preview: string[];
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [selectedPerson, setSelectedPerson] = useState('');
  const [personName, setPersonName] = useState('');
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');
  const router = useRouter();

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
    const lines = text.split('\n').filter(line => line.trim());
    
    // Basic WhatsApp message pattern: [Date, Time] Contact: Message
    const messagePattern = /^\[\d{1,2}\/\d{1,2}\/\d{2,4}, \d{1,2}:\d{2}:\d{2}\s?[AP]?M?\]\s*([^:]+):\s*(.+)$/;
    
    const messages: { sender: string; content: string; date: string }[] = [];
    const participants = new Set<string>();
    
    lines.forEach(line => {
      const match = line.match(messagePattern);
      if (match) {
        const [, sender, content] = match;
        const cleanSender = sender.trim();
        participants.add(cleanSender);
        messages.push({ sender: cleanSender, content: content.trim(), date: line.substring(1, line.indexOf(']')) });
      }
    });

    if (messages.length === 0) {
      throw new Error('No valid WhatsApp messages found. Please check your file format.');
    }

    const dateRange = messages.length > 0 ? 
      `${messages[0].date} - ${messages[messages.length - 1].date}` : 
      'Unknown';

    return {
      totalMessages: messages.length,
      dateRange,
      participants: Array.from(participants),
      preview: messages.slice(0, 5).map(m => `${m.sender}: ${m.content.substring(0, 100)}${m.content.length > 100 ? '...' : ''}`)
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

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('selectedPerson', selectedPerson);
      formData.append('personName', personName.trim());

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      setSessionId(data.sessionId);
      
      // Redirect to chat with session ID
      router.push(`/chat/${data.sessionId}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chat session');
    } finally {
      setUploading(false);
    }
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
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-gray-600 text-center">
                    {progress < 50 ? 'Parsing messages...' : 'Analyzing conversation...'}
                  </p>
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