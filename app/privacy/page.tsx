import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Eye, Trash2, Lock } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
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
            <h1 className="text-3xl font-bold text-gray-900">Privacy & Security</h1>
            <p className="text-gray-600 mt-1">Your memories deserve the highest protection</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Privacy Promise */}
          <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-600" />
                Our Privacy Promise
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p className="text-lg text-gray-700 mb-4">
                EchoSoul was built with your privacy as the foundation. We understand that the conversations 
                you're sharing are deeply personal and irreplaceable memories.
              </p>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 my-6">
                <p className="text-green-800 font-medium">
                  <strong>We never store, sell, or share your conversations.</strong> Your data is processed 
                  temporarily and automatically deleted when your session ends.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* How We Protect You */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lock className="w-5 h-5 text-blue-600" />
                  Secure Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li>• All data is encrypted in transit and at rest</li>
                  <li>• Processing happens in secure, isolated environments</li>
                  <li>• No human staff can access your conversations</li>
                  <li>• Sessions use temporary, anonymous identifiers</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  Automatic Deletion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li>• Messages deleted within 24 hours of inactivity</li>
                  <li>• AI models don't retain conversation history</li>
                  <li>• Embeddings are purged from vector database</li>
                  <li>• No backups or archives are created</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="w-5 h-5 text-purple-600" />
                  Limited Data Use
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li>• Only messages from your chosen person are processed</li>
                  <li>• Media files and attachments are ignored</li>
                  <li>• Personal information is not extracted or stored</li>
                  <li>• No profiling or behavioral analysis</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                  Your Rights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li>• End your session at any time</li>
                  <li>• Request immediate data deletion</li>
                  <li>• Export your conversation history</li>
                  <li>• Contact us with privacy concerns</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Technical Details */}
          <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle>Technical Implementation</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Data Processing Flow</h3>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                  <div>
                    <strong>Upload:</strong> Your WhatsApp file is temporarily stored in encrypted memory, never written to disk.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                  <div>
                    <strong>Processing:</strong> Messages are parsed and only those from your chosen person are kept.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                  <div>
                    <strong>Embedding:</strong> Text is converted to vectors using AI, stored temporarily in ChromaDB.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">4</div>
                  <div>
                    <strong>Chat:</strong> Your messages are matched with relevant memories to generate responses.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">5</div>
                  <div>
                    <strong>Cleanup:</strong> All data is automatically purged after 24 hours of inactivity.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="border-0 bg-blue-50/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-gray-800 mb-2">Questions about privacy?</h3>
              <p className="text-gray-600 mb-4">
                We're here to address any concerns about how your data is handled.
              </p>
              <Button variant="outline" className="bg-white/50">
                Contact Privacy Team
              </Button>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-gray-500">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p className="mt-2">EchoSoul is designed to honor your memories while protecting your privacy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}