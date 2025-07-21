import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextPage } from 'next'; // Import NextPage for proper typing
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Calendar, Clock, Heart, MessageCircle, Users, Brain, HelpCircle } from 'lucide-react';

interface BlogPost {
  title: string;
  description: string;
  slug: string;
  category: string;
  readTime: string;
  publishDate: string;
  featured: boolean;
  icon: any;
}

const allBlogPosts: BlogPost[] = [
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
    featured: true,
    icon: Brain,
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
    icon: Brain,
  },
  {
    title: 'Digital Grief Healing Guide 2024',
    description: 'Complete 2024 guide to digital grief healing and how technology helps process loss and find comfort.',
    slug: 'digital-grief-healing-guide-2024',
    category: 'Grief & Healing',
    readTime: '14 min read',
    publishDate: '2024-01-25',
    featured: true,
    icon: Heart,
  },
  {
    title: 'Complete Getting Started Guide',
    description: 'Step-by-step guide to preserving your most precious digital conversations and creating lasting emotional connections.',
    slug: 'getting-started-guide',
    category: 'Getting Started',
    readTime: '30 min read',
    publishDate: '2024-01-20',
    featured: true,
    icon: HelpCircle,
  }
];

const categoryInfo = {
  'connection': {
    title: 'Connection',
    description: 'Articles about maintaining and strengthening emotional connections through digital memories and preserved conversations.',
    color: 'purple',
    icon: Heart,
  },
  'psychology': {
    title: 'Psychology',
    description: 'Explore the psychological aspects of digital memory preservation and how our minds process digital relationships.',
    color: 'blue',
    icon: Brain,
  },
  'digital-legacy': {
    title: 'Digital Legacy',
    description: 'Guides on creating and managing your digital legacy to ensure your memories live on for future generations.',
    color: 'green',
    icon: Users,
  },
  'technology': {
    title: 'Technology',
    description: 'Technical guides and insights about digital platforms, messaging apps, and memory preservation technology.',
    color: 'emerald',
    icon: MessageCircle,
  },
  'grief-healing': {
    title: 'Grief & Healing',
    description: 'Support and guidance for using digital memories and technology to process grief and find healing.',
    color: 'pink',
    icon: Heart,
  },
  'science': {
    title: 'Science',
    description: 'Scientific research and insights into memory, emotion, and the neuroscience of digital relationships.',
    color: 'indigo',
    icon: Brain,
  },
  'getting-started': {
    title: 'Getting Started',
    description: 'Beginner guides and tutorials to help you start your digital memory preservation journey.',
    color: 'yellow',
    icon: HelpCircle,
  }
};

// Define the interface for params
interface CategoryPageProps {
  params: Promise<{ slug: string }>; // Use Promise for dynamic route params
}

// Update generateMetadata to handle params as a Promise
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params; // Await the params to resolve the Promise
  const category = categoryInfo[slug as keyof typeof categoryInfo];

  if (!category) {
    return {
      title: 'Category Not Found | Talkers Blog',
    };
  }

  return {
    title: `${category.title} Articles - Digital Memory Preservation Blog | Talkers`,
    description: `${category.description} Read expert articles about ${category.title.toLowerCase()} and digital memory preservation.`,
    keywords: `${category.title.toLowerCase()}, digital memory preservation, ${category.title.toLowerCase()} articles, memory preservation blog, emotional connections, digital conversations`,
    openGraph: {
      title: `${category.title} Articles - Digital Memory Preservation | Talkers`,
      description: category.description,
      type: 'website',
      url: `/blog/category/${slug}`,
    },
    alternates: {
      canonical: `/blog/category/${slug}`,
    },
  };
}

// Update CategoryPage to use NextPage and handle params as a Promise
const CategoryPage: NextPage<CategoryPageProps> = async ({ params }) => {
  const { slug } = await params; // Await the params to resolve the Promise
  const category = categoryInfo[slug as keyof typeof categoryInfo];

  if (!category) {
    notFound();
  }

  const categoryPosts = allBlogPosts.filter(
    (post) => post.category.toLowerCase().replace(/\s+/g, '-').replace('&', '') === slug
  );

  const IconComponent = category.icon;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.title} Articles`,
    description: category.description,
    url: `/blog/category/${slug}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: categoryPosts.length,
      itemListElement: categoryPosts.map((post, index) => ({
        '@type': 'Article',
        position: index + 1,
        name: post.title,
        description: post.description,
        url: `/blog/${post.slug}`,
      })),
    },
  };

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
              <div className={`w-16 h-16 bg-gradient-to-br from-${category.color}-400 to-${category.color}-600 rounded-full flex items-center justify-center`}>
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
                  <span className={`bg-gradient-to-r from-${category.color}-600 to-${category.color}-800 bg-clip-text text-transparent`}>
                    {category.title}
                  </span>
                  <br />
                  Articles
                </h1>
                <p className="text-xl text-gray-600 mt-4 leading-relaxed">
                  {category.description}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {categoryPosts.length} Article{categoryPosts.length !== 1 ? 's' : ''} in {category.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Expert insights and guides about {category.title.toLowerCase()}
                  </p>
                </div>
                <Badge 
                  variant="secondary" 
                  className={`bg-${category.color}-100 text-${category.color}-700 border-${category.color}-200`}
                >
                  {category.title}
                </Badge>
              </div>
            </div>
          </header>

          {/* Articles Grid */}
          <section className="mb-12">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categoryPosts.map((post) => {
                const PostIconComponent = post.icon;
                return (
                  <Card key={post.slug} className="group overflow-hidden bg-white/60 backdrop-blur-sm border border-white/40 hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge 
                          variant="outline" 
                          className={`bg-${category.color}-50 text-${category.color}-700 border-${category.color}-200`}
                        >
                          {post.category}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 bg-gradient-to-br from-${category.color}-100 to-${category.color}-200 rounded-lg flex-shrink-0`}>
                          <PostIconComponent className={`w-5 h-5 text-${category.color}-600`} />
                        </div>
                        <div>
                          <CardTitle className={`text-xl font-bold text-gray-900 group-hover:text-${category.color}-600 transition-colors line-clamp-2`}>
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`group text-${category.color}-600 hover:text-${category.color}-700 hover:bg-${category.color}-50`}
                          >
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
          </section>

          {/* Browse Other Categories */}
          <section className="mt-16 pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Browse Other Categories</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(categoryInfo)
                .filter(([catSlug]) => catSlug !== slug)
                .map(([catSlug, info]) => {
                  const CategoryIcon = info.icon;
                  return (
                    <Link key={catSlug} href={`/blog/category/${catSlug}`}>
                      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 bg-gradient-to-br from-${info.color}-100 to-${info.color}-200 rounded-lg`}>
                              <CategoryIcon className={`w-5 h-5 text-${info.color}-600`} />
                            </div>
                            <h4 className={`font-semibold text-gray-900 group-hover:text-${info.color}-600 transition-colors`}>
                              {info.title}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {info.description}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
            </div>
          </section>

          {/* CTA Section */}
          <section className="mt-16">
            <Card className={`bg-gradient-to-r from-${category.color}-50 to-${category.color}-100 border border-${category.color}-200/50`}>
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Start Your Memory Preservation Journey?
                </h3>
                <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                  Apply the insights from our {category.title.toLowerCase()} articles to your own digital 
                  memory preservation. Start preserving your most precious conversations today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/signup">
                    <Button className={`bg-gradient-to-r from-${category.color}-600 to-${category.color}-700 hover:from-${category.color}-700 hover:to-${category.color}-800 text-white`}>
                      Start Free Trial
                    </Button>
                  </Link>
                  <Link href="/blog/getting-started-guide">
                    <Button variant="outline" className={`border-${category.color}-300 text-${category.color}-700 hover:bg-${category.color}-50`}>
                      Read Getting Started Guide
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
};

export default CategoryPage;

export async function generateStaticParams() {
  return Object.keys(categoryInfo).map((slug) => ({
    slug,
  }));
}