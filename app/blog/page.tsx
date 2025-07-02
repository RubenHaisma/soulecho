import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowRight, Heart, MessageCircle, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog | Talkers - Preserving Memories & Digital Connections',
  description: 'Expert insights on digital memory preservation, grief healing, and maintaining connections with loved ones through technology. Learn how to cherish and preserve precious memories.',
  keywords: 'digital memories, grief healing, memory preservation, WhatsApp conversations, digital legacy, emotional connections, bereavement support',
  openGraph: {
    title: 'Blog | Talkers - Preserving Memories & Digital Connections',
    description: 'Expert insights on digital memory preservation, grief healing, and maintaining connections with loved ones through technology.',
    type: 'website',
    url: '/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Talkers - Preserving Memories & Digital Connections',
    description: 'Expert insights on digital memory preservation, grief healing, and maintaining connections with loved ones.',
  }
};

const blogPosts = [
  {
    title: 'Digital Grief Healing Guide 2024',
    description: 'Complete 2024 guide to digital grief healing and how technology helps process loss and find comfort in digital memories.',
    slug: 'digital-grief-healing-guide-2024',
    category: 'Grief & Healing',
    readTime: '14 min read',
    publishDate: '2024-01-25',
    featured: true,
    icon: Heart,
  },
  {
    title: 'Complete Getting Started Guide',
    description: 'Step-by-step guide to preserving your most precious digital conversations and creating lasting emotional connections in just 30 minutes.',
    slug: 'getting-started-guide',
    category: 'Getting Started',
    readTime: '30 min read',
    publishDate: '2024-01-20',
    featured: true,
    icon: Users,
  },
  {
    title: 'How to Reconnect with Loved Ones Through Digital Memories',
    description: 'Discover the healing power of preserved conversations and how they can help you maintain emotional connections with those who matter most.',
    slug: 'reconnect-with-loved-ones',
    category: 'Connection',
    readTime: '8 min read',
    publishDate: '2024-01-15',
    featured: true,
    icon: Heart,
  },
  {
    title: 'The Psychology of Digital Memory Preservation',
    description: 'Understanding how our minds process digital memories and why preserving conversations can be crucial for emotional healing.',
    slug: 'psychology-digital-memory-preservation',
    category: 'Psychology',
    readTime: '12 min read',
    publishDate: '2024-01-10',
    featured: false,
    icon: MessageCircle,
  },
  {
    title: 'Creating a Digital Legacy: What You Need to Know',
    description: 'A comprehensive guide to preserving your digital footprint and ensuring your memories live on for future generations.',
    slug: 'creating-digital-legacy-guide',
    category: 'Digital Legacy',
    readTime: '15 min read',
    publishDate: '2024-01-05',
    featured: false,
    icon: Users,
  },
  {
    title: 'WhatsApp Conversations: Windows to Our Hearts',
    description: 'Exploring how casual digital conversations become precious memories and why they matter more than we think.',
    slug: 'whatsapp-conversations-emotional-value',
    category: 'Technology',
    readTime: '6 min read',
    publishDate: '2023-12-28',
    featured: false,
    icon: MessageCircle,
  },
  {
    title: 'Grief in the Digital Age: Finding Comfort in Technology',
    description: 'How modern technology can support the grieving process and help us find comfort in preserved memories.',
    slug: 'grief-digital-age-technology-comfort',
    category: 'Grief & Healing',
    readTime: '10 min read',
    publishDate: '2023-12-20',
    featured: false,
    icon: Heart,
  },
  {
    title: 'The Science Behind Emotional Memory Triggers',
    description: 'Understanding how specific words, phrases, and conversation patterns can trigger powerful emotional memories.',
    slug: 'science-emotional-memory-triggers',
    category: 'Science',
    readTime: '9 min read',
    publishDate: '2023-12-15',
    featured: false,
    icon: MessageCircle,
  },
];

const categories = ['All', 'Getting Started', 'Connection', 'Psychology', 'Digital Legacy', 'Technology', 'Grief & Healing', 'Science'];

export default function BlogPage() {
  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfdfd] via-[#f8f9ff] to-[#f0f4ff]">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:py-24">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-purple-100/50 backdrop-blur-sm border border-purple-200/50 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-purple-700">Insights & Stories</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Stories of
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Connection
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Explore the intersection of technology, memory, and human connection. Discover how digital preservation 
            can help heal, connect, and honor the relationships that matter most.
          </p>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="px-4 py-2 bg-white/60 hover:bg-white/80 text-gray-700 border border-gray-200/50 cursor-pointer transition-all hover:scale-105"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="px-4 mb-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">Featured Stories</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {featuredPosts.map((post) => {
              const IconComponent = post.icon;
              return (
                <Card key={post.slug} className="group overflow-hidden bg-white/60 backdrop-blur-sm border border-white/40 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {post.category}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex-shrink-0">
                        <IconComponent className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                          {post.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                      {post.description}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.publishDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <Link href={`/blog/${post.slug}`}>
                        <Button variant="ghost" size="sm" className="group text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                          Read More
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">All Articles</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => {
              const IconComponent = post.icon;
              return (
                <Card key={post.slug} className="group overflow-hidden bg-white/40 backdrop-blur-sm border border-white/30 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        {post.category}
                      </Badge>
                      <div className="p-1.5 bg-gradient-to-br from-purple-100 to-blue-100 rounded-md">
                        <IconComponent className="w-4 h-4 text-purple-600" />
                      </div>
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-2">
                      {post.description}
                    </CardDescription>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.publishDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </div>
                    </div>
                    <Link href={`/blog/${post.slug}`} className="block mt-3">
                      <Button variant="ghost" size="sm" className="w-full group text-purple-600 hover:text-purple-700 hover:bg-purple-50 text-sm">
                        Read Article
                        <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="px-4 mb-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">Essential Resources</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <Link href="/blog/resources">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    Complete Resource Hub
                  </h3>
                  <p className="text-sm text-gray-600">
                    Access our comprehensive library of guides, tutorials, and expert insights all in one place.
                  </p>
                </CardContent>
              </Link>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <Link href="/blog/faq">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <MessageCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
                    Frequently Asked Questions
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get answers to 15+ common questions about digital memory preservation and grief support.
                  </p>
                </CardContent>
              </Link>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <Link href="/blog/getting-started-guide">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                    Getting Started Guide
                  </h3>
                  <p className="text-sm text-gray-600">
                    30-minute step-by-step tutorial to start preserving your most precious conversations today.
                  </p>
                </CardContent>
              </Link>
            </Card>
          </div>
          
          {/* Browse by Category */}
          <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Browse by Category</h3>
            <div className="grid md:grid-cols-4 gap-3">
              {categories.filter(cat => cat !== 'All').map((category) => (
                <Link key={category} href={`/blog/category/${category.toLowerCase().replace(/\s+/g, '-').replace('&', '')}`}>
                  <Button variant="outline" size="sm" className="w-full text-sm hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-all">
                    {category}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200/50">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Stay Connected to What Matters
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Get insights on memory preservation, digital wellness, and meaningful connections 
                delivered to your inbox. Join our community of people who believe memories should live on.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  Subscribe to Updates
                </Button>
                <Link href="/auth/signup">
                  <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                    Start Preserving Memories
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
