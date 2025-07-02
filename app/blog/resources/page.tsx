import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, BookOpen, Download, Heart, MessageCircle, Users, Brain, Shield, HelpCircle, ExternalLink, Star, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Digital Memory Preservation Resources Hub - Complete Guide Library | Talkers',
  description: 'Comprehensive resource library for digital memory preservation, WhatsApp chat backup, grief healing, and emotional connection through technology. Free guides, tutorials, and expert insights.',
  keywords: 'digital memory preservation resources, WhatsApp backup guide, grief healing resources, memory preservation tools, digital legacy planning, conversation preservation tutorial, emotional healing technology',
  openGraph: {
    title: 'Digital Memory Preservation Resources Hub | Talkers',
    description: 'Comprehensive resource library for digital memory preservation, grief healing, and emotional connection through technology.',
    type: 'website',
    url: '/blog/resources',
  },
  alternates: {
    canonical: '/blog/resources',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const resourceCategories = [
  {
    title: "Getting Started",
    description: "Essential guides for beginners to digital memory preservation",
    icon: HelpCircle,
    color: "green",
    resources: [
      {
        title: "Complete Getting Started Guide",
        description: "30-minute step-by-step tutorial for preserving your first conversations",
        link: "/blog/getting-started-guide",
        type: "Guide",
        readTime: "30 min",
        difficulty: "Beginner"
      },
      {
        title: "Frequently Asked Questions",
        description: "Answers to 15+ common questions about digital memory preservation",
        link: "/blog/faq",
        type: "FAQ",
        readTime: "10 min",
        difficulty: "Beginner"
      }
    ]
  },
  {
    title: "Technical Guides",
    description: "Platform-specific tutorials and technical instructions",
    icon: MessageCircle,
    color: "blue",
    resources: [
      {
        title: "WhatsApp Conversations: Emotional Value Guide",
        description: "Understanding why WhatsApp chats are emotionally powerful and how to preserve them",
        link: "/blog/whatsapp-conversations-emotional-value",
        type: "Guide",
        readTime: "6 min",
        difficulty: "Beginner"
      },
      {
        title: "Creating a Digital Legacy",
        description: "15-minute comprehensive guide to digital estate planning",
        link: "/blog/creating-digital-legacy-guide",
        type: "Guide",
        readTime: "15 min",
        difficulty: "Intermediate"
      }
    ]
  },
  {
    title: "Emotional Support",
    description: "Resources for grief healing and emotional well-being",
    icon: Heart,
    color: "pink",
    resources: [
      {
        title: "Digital Grief Healing Guide 2024",
        description: "Complete guide to using technology for grief processing and healing",
        link: "/blog/digital-grief-healing-guide-2024",
        type: "Guide",
        readTime: "14 min",
        difficulty: "Intermediate"
      },
      {
        title: "Reconnecting with Loved Ones Through Digital Memories",
        description: "How preserved conversations help maintain emotional connections",
        link: "/blog/reconnect-with-loved-ones",
        type: "Article",
        readTime: "8 min",
        difficulty: "Beginner"
      },
      {
        title: "Grief in the Digital Age",
        description: "Finding comfort and support through technology and preserved memories",
        link: "/blog/grief-digital-age-technology-comfort",
        type: "Article",
        readTime: "10 min",
        difficulty: "Beginner"
      }
    ]
  },
  {
    title: "Psychology & Science",
    description: "Research-backed insights into digital memory and emotion",
    icon: Brain,
    color: "purple",
    resources: [
      {
        title: "Psychology of Digital Memory Preservation",
        description: "Neuroscience behind digital memories and emotional processing",
        link: "/blog/psychology-digital-memory-preservation",
        type: "Research",
        readTime: "12 min",
        difficulty: "Advanced"
      },
      {
        title: "Science Behind Emotional Memory Triggers",
        description: "How words and phrases trigger powerful emotional memories",
        link: "/blog/science-emotional-memory-triggers",
        type: "Research",
        readTime: "9 min",
        difficulty: "Advanced"
      }
    ]
  }
];

const quickLinks = [
  {
    title: "Export WhatsApp Conversations",
    description: "Quick tutorial for backing up your WhatsApp chats",
    icon: Download,
    link: "/blog/getting-started-guide#whatsapp-export"
  },
  {
    title: "Privacy & Security Guide",
    description: "Keep your memories safe and private",
    icon: Shield,
    link: "/privacy"
  },
  {
    title: "Start Free Trial",
    description: "Begin preserving your digital memories today",
    icon: Star,
    link: "/auth/signup"
  },
  {
    title: "Contact Support",
    description: "Get help with your memory preservation journey",
    icon: MessageCircle,
    link: "/contact"
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Digital Memory Preservation Resources",
  "description": "Comprehensive resource library for digital memory preservation, grief healing, and emotional connection through technology",
  "url": "/blog/resources",
  "mainEntity": {
    "@type": "ItemList",
    "numberOfItems": resourceCategories.reduce((acc, cat) => acc + cat.resources.length, 0),
    "itemListElement": resourceCategories.flatMap(category => 
      category.resources.map((resource, index) => ({
        "@type": "Article",
        "position": index + 1,
        "name": resource.title,
        "description": resource.description,
        "url": resource.link
      }))
    )
  }
};

export default function ResourcesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-[#f8f9ff] to-[#f0f4ff]">
        <article className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Link href="/blog">
              <Button variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>

          <header className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
                  <span className="bg-gradient-to-r from-orange-600 to-red-800 bg-clip-text text-transparent">
                    Resources
                  </span>
                  <br />
                  Hub
                </h1>
                <p className="text-xl text-gray-600 mt-4 leading-relaxed">
                  Your complete library for digital memory preservation, grief healing, and emotional connection through technology.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200/50 p-6">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-orange-600">8+</div>
                  <div className="text-sm text-gray-600">Comprehensive Guides</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600">100%</div>
                  <div className="text-sm text-gray-600">Free to Access</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600">Expert</div>
                  <div className="text-sm text-gray-600">Researched Content</div>
                </div>
              </div>
            </div>
          </header>

          {/* Quick Links */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Links</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link, index) => {
                const IconComponent = link.icon;
                return (
                  <Link key={index} href={link.link}>
                    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group h-full">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {link.title}
                        </h3>
                        <p className="text-sm text-gray-600">{link.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Resource Categories */}
          {resourceCategories.map((category, categoryIndex) => {
            const IconComponent = category.icon;
            return (
              <section key={categoryIndex} className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 bg-gradient-to-br from-${category.color}-400 to-${category.color}-600 rounded-full flex items-center justify-center`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                    <p className="text-gray-600">{category.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.resources.map((resource, resourceIndex) => (
                    <Card key={resourceIndex} className="group overflow-hidden bg-white/60 backdrop-blur-sm border border-white/40 hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className={`bg-${category.color}-50 text-${category.color}-700 border-${category.color}-200`}>
                            {resource.type}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">{resource.readTime}</Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                resource.difficulty === 'Beginner' ? 'border-green-300 text-green-700' :
                                resource.difficulty === 'Intermediate' ? 'border-yellow-300 text-yellow-700' :
                                'border-red-300 text-red-700'
                              }`}
                            >
                              {resource.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <CardTitle className={`text-lg font-bold text-gray-900 group-hover:text-${category.color}-600 transition-colors line-clamp-2`}>
                          {resource.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                          {resource.description}
                        </CardDescription>
                        <Link href={resource.link}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`w-full group text-${category.color}-600 hover:text-${category.color}-700 hover:bg-${category.color}-50`}
                          >
                            Read {resource.type}
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}

          {/* Featured Tools */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Tools & Resources</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Talkers Platform</h3>
                      <p className="text-blue-700">AI-powered memory preservation</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-6">
                    Preserve and interact with your most meaningful digital conversations. Our AI understands context and emotion to create meaningful experiences.
                  </p>
                  <div className="flex gap-4">
                    <Link href="/auth/signup">
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        Start Free Trial
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button variant="outline" className="border-blue-300 text-blue-700">
                        View Pricing
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Grief Support Community</h3>
                      <p className="text-purple-700">Connect with others who understand</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-6">
                    Join our supportive community of people using digital memories for healing. Share experiences and find comfort together.
                  </p>
                  <div className="flex gap-4">
                    <Link href="/contact">
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        Join Community
                      </Button>
                    </Link>
                    <Link href="/blog/grief-digital-age-technology-comfort">
                      <Button variant="outline" className="border-purple-300 text-purple-700">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Browse by Category */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Connection', slug: 'connection', color: 'purple', count: 2 },
                { name: 'Psychology', slug: 'psychology', color: 'blue', count: 2 },
                { name: 'Technology', slug: 'technology', color: 'emerald', count: 1 },
                { name: 'Grief & Healing', slug: 'grief-healing', color: 'pink', count: 3 }
              ].map((category, index) => (
                <Link key={index} href={`/blog/category/${category.slug}`}>
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 bg-gradient-to-br from-${category.color}-100 to-${category.color}-200 rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <span className={`text-${category.color}-600 font-bold`}>{category.count}</span>
                      </div>
                      <h3 className={`font-semibold text-gray-900 group-hover:text-${category.color}-600 transition-colors mb-2`}>
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {category.count} article{category.count !== 1 ? 's' : ''}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* Newsletter Signup */}
          <section className="mt-16">
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200/50">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Stay Updated with New Resources
                </h3>
                <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                  Get notified when we publish new guides, research insights, and resources to help you 
                  preserve your digital memories and maintain emotional connections.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact">
                    <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white">
                      Subscribe to Updates
                    </Button>
                  </Link>
                  <Link href="/blog">
                    <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                      Browse All Articles
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        </article>
      </div>
    </>
  );
} 