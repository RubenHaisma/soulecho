import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Archive, Calendar, Clock, Share2, Shield, Users, FileText, Cloud } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Creating a Digital Legacy: Complete Guide 2024 | Talkers',
  description: 'A comprehensive guide to preserving your digital footprint and ensuring your memories live on for future generations. Learn how to create lasting digital legacies.',
  keywords: 'digital legacy, digital inheritance, digital estate planning, memory preservation, digital footprint, online legacy, digital assets, future generations',
  openGraph: {
    title: 'Creating a Digital Legacy: What You Need to Know',
    description: 'A comprehensive guide to preserving your digital footprint and ensuring your memories live on for future generations.',
    type: 'article',
    url: '/blog/creating-digital-legacy-guide',
    publishedTime: '2024-01-05',
    authors: ['Talkers Team'],
    tags: ['digital legacy', 'digital inheritance', 'memory preservation', 'estate planning'],
  }
};

export default function DigitalLegacyGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-[#f8f9ff] to-[#f0f4ff]">
      <article className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/blog">
            <Button variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>

        <header className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-green-100 text-green-700 border-green-200">Digital Legacy</Badge>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                January 5, 2024
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                15 min read
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Creating a
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Digital Legacy</span>
            <br />What You Need to Know
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            A comprehensive guide to preserving your digital footprint and ensuring your memories, 
            values, and connections live on for future generations.
          </p>

          <div className="flex items-center justify-between pb-8 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                <Archive className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Talkers Team</p>
                <p className="text-sm text-gray-500">Digital Preservation Experts</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </header>

        <div className="prose prose-lg max-w-none">
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Why Digital Legacy Matters</h3>
                    <p className="text-gray-700 text-base">
                      In the digital age, our most precious memories, relationships, and expressions of self 
                      exist in digital spaces. Without proper planning, these irreplaceable pieces of our 
                      lives can be lost forever.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Understanding Digital Legacy</h2>
          
          <p className="text-gray-700 mb-6 leading-relaxed">
            Your digital legacy encompasses all the digital content, accounts, and online presence you create 
            throughout your lifetime. This includes social media profiles, email accounts, photos, messages, 
            documents stored in the cloud, and even your online relationships and interactions.
          </p>

          <p className="text-gray-700 mb-6 leading-relaxed">
            Unlike physical assets, digital assets exist in a complex ecosystem of platforms, services, and 
            legal frameworks. Without proper planning, even the most meaningful digital memories can become 
            inaccessible when we&apos;re no longer here to manage them.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Types of Digital Assets to Consider</h2>

          <div className="grid md:grid-cols-2 gap-6 my-8">
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Personal Content</h4>
                </div>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Photos and videos</li>
                  <li>• Personal documents and writings</li>
                  <li>• Creative works and projects</li>
                  <li>• Digital journals and blogs</li>
                  <li>• Voice recordings and messages</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Social Connections</h4>
                </div>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Social media profiles and posts</li>
                  <li>• Message conversations</li>
                  <li>• Contact lists and relationships</li>
                  <li>• Online community memberships</li>
                  <li>• Professional networks</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 my-8">
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Cloud className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-gray-900">Digital Accounts</h4>
                </div>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Email accounts</li>
                  <li>• Cloud storage services</li>
                  <li>• Subscription services</li>
                  <li>• Online banking and financial accounts</li>
                  <li>• Digital wallets and cryptocurrency</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Archive className="w-5 h-5 text-orange-600" />
                  <h4 className="font-semibold text-gray-900">Digital Creations</h4>
                </div>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Websites and blogs</li>
                  <li>• Digital art and designs</li>
                  <li>• Music and audio content</li>
                  <li>• Software and code repositories</li>
                  <li>• Online business assets</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">The Challenges of Digital Inheritance</h2>

          <p className="text-gray-700 mb-6 leading-relaxed">
            Digital inheritance faces unique challenges that don&apos;t exist with physical assets. Understanding 
            these challenges is the first step in creating an effective digital legacy plan.
          </p>

          <div className="space-y-6 my-8">
            <div className="border-l-4 border-red-400 pl-6">
              <h4 className="font-semibold text-gray-900 mb-2">Legal Complexity</h4>
              <p className="text-gray-700 text-sm">
                Terms of service agreements, privacy laws, and varying jurisdictions create a complex legal 
                landscape for digital inheritance.
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-6">
              <h4 className="font-semibold text-gray-900 mb-2">Access Control</h4>
              <p className="text-gray-700 text-sm">
                Two-factor authentication, encrypted devices, and frequent password changes can make 
                accounts inaccessible to loved ones.
              </p>
            </div>
            
            <div className="border-l-4 border-blue-400 pl-6">
              <h4 className="font-semibold text-gray-900 mb-2">Platform Policies</h4>
              <p className="text-gray-700 text-sm">
                Different platforms have varying policies for handling deceased users&apos; accounts, from 
                memorialization to permanent deletion.
              </p>
            </div>
            
            <div className="border-l-4 border-purple-400 pl-6">
              <h4 className="font-semibold text-gray-900 mb-2">Technology Evolution</h4>
              <p className="text-gray-700 text-sm">
                Rapid technological change means file formats, platforms, and storage methods can become 
                obsolete over time.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Creating Your Digital Legacy Plan</h2>

          <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Digital Asset Inventory</h3>

          <p className="text-gray-700 mb-6 leading-relaxed">
            Start by creating a comprehensive inventory of all your digital assets. This includes not just 
            accounts and files, but also the emotional and practical value of different digital content.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-8">
            <h4 className="font-semibold text-gray-900 mb-3">Digital Asset Checklist</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Social media accounts</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Email accounts</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Cloud storage files</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Photos and videos</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Message conversations</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Digital documents</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Online subscriptions</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Digital financial assets</span>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 2: Access Planning</h3>

          <p className="text-gray-700 mb-6 leading-relaxed">
            Ensure your loved ones can access your digital assets when needed. This involves both technical 
            and legal considerations.
          </p>

          <div className="grid md:grid-cols-3 gap-4 my-8">
            <Card className="bg-green-50 border border-green-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-green-800 mb-2">Password Management</h4>
                <p className="text-green-700 text-sm">
                  Use a password manager with emergency access features for trusted contacts
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Legal Documentation</h4>
                <p className="text-blue-700 text-sm">
                  Include digital assets in wills and consider digital estate planning tools
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border border-purple-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-purple-800 mb-2">Trusted Contacts</h4>
                <p className="text-purple-700 text-sm">
                  Designate digital executors and provide them with necessary information
                </p>
              </CardContent>
            </Card>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 3: Content Curation</h3>

          <p className="text-gray-700 mb-6 leading-relaxed">
            Not all digital content needs to be preserved forever. Focus on curating the most meaningful 
            and valuable content that truly represents your legacy.
          </p>

          <div className="space-y-4 my-8">
            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">High Priority</h4>
                <p className="text-gray-600 text-sm">
                  Family photos, important conversations, personal writings, and creative works
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Medium Priority</h4>
                <p className="text-gray-600 text-sm">
                  Social media posts, professional content, and shared memories with friends
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Consider Deletion</h4>
                <p className="text-gray-600 text-sm">
                  Temporary files, outdated content, and information you wouldn&apos;t want preserved
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Platform-Specific Considerations</h2>

          <h3 className="text-xl font-semibold text-gray-900 mb-4">Social Media Platforms</h3>

          <div className="grid md:grid-cols-2 gap-6 my-8">
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Facebook</h5>
                <p className="text-sm text-gray-600 mb-2">Offers legacy contacts and memorialization options</p>
                <p className="text-xs text-gray-500">Configure in Settings &gt; Security &gt; Legacy Contact</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Google</h5>
                <p className="text-sm text-gray-600 mb-2">Inactive Account Manager for multiple Google services</p>
                <p className="text-xs text-gray-500">Set up through Google Account settings</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Apple iCloud</h5>
                <p className="text-sm text-gray-600 mb-2">Digital Legacy feature allows data transfer to beneficiaries</p>
                <p className="text-xs text-gray-500">Configure in Apple ID settings</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Other Platforms</h5>
                <p className="text-sm text-gray-600 mb-2">Check individual terms of service and memorial policies</p>
                <p className="text-xs text-gray-500">Policies vary widely across platforms</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Best Practices for Long-term Preservation</h2>

          <div className="bg-gray-50 border-l-4 border-gray-400 p-6 my-8">
            <h4 className="font-semibold text-gray-900 mb-3">The 3-2-1 Rule for Digital Preservation</h4>
            <ul className="text-gray-700 space-y-2">
              <li><strong>3 copies</strong> of important data (original plus 2 backups)</li>
              <li><strong>2 different storage media</strong> (cloud and physical storage)</li>
              <li><strong>1 copy stored off-site</strong> (geographic redundancy)</li>
            </ul>
          </div>

          <div className="space-y-6 my-8">
            <div className="border-l-4 border-green-400 pl-6">
              <h4 className="font-semibold text-gray-900 mb-2">Regular Updates</h4>
              <p className="text-gray-700 text-sm">
                Review and update your digital legacy plan annually or after major life changes.
              </p>
            </div>
            
            <div className="border-l-4 border-blue-400 pl-6">
              <h4 className="font-semibold text-gray-900 mb-2">Format Considerations</h4>
              <p className="text-gray-700 text-sm">
                Choose widely-supported file formats (PDF, JPEG, MP4) for long-term accessibility.
              </p>
            </div>
            
            <div className="border-l-4 border-purple-400 pl-6">
              <h4 className="font-semibold text-gray-900 mb-2">Documentation</h4>
              <p className="text-gray-700 text-sm">
                Maintain clear documentation about your digital assets and access instructions.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Creating Meaningful Digital Memorials</h2>

          <p className="text-gray-700 mb-6 leading-relaxed">
            Beyond preservation, consider how your digital legacy can actively contribute to the lives of 
            those you leave behind. This might include curated photo albums, recorded messages for future 
            milestones, or preserved conversations that capture your personality and values.
          </p>

          <div className="mt-12 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200/50">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Start Building Your Digital Legacy Today</h3>
            <p className="text-gray-700 mb-4">
              Talkers provides secure, long-term preservation of your most meaningful digital conversations 
              and memories, ensuring they remain accessible and meaningful for generations to come.
            </p>
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white">
                Preserve Your Legacy
              </Button>
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
} 