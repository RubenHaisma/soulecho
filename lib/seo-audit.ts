interface SEOAuditResult {
  score: number;
  issues: string[];
  suggestions: string[];
  passed: string[];
}

interface SEOCheck {
  name: string;
  check: () => Promise<boolean>;
  weight: number;
  suggestion: string;
}

export class SEOAuditor {
  private checks: SEOCheck[] = [
    {
      name: 'Title Tag Present',
      check: async () => {
        if (typeof window === 'undefined') return true;
        return !!document.title && document.title.length > 0;
      },
      weight: 10,
      suggestion: 'Add a descriptive title tag to every page'
    },
    {
      name: 'Title Tag Length',
      check: async () => {
        if (typeof window === 'undefined') return true;
        return document.title.length >= 30 && document.title.length <= 60;
      },
      weight: 8,
      suggestion: 'Keep title tags between 30-60 characters for optimal display'
    },
    {
      name: 'Meta Description Present',
      check: async () => {
        if (typeof window === 'undefined') return true;
        const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
        return !!metaDesc?.content && metaDesc.content.length > 0;
      },
      weight: 9,
      suggestion: 'Add meta descriptions to all pages'
    },
    {
      name: 'Meta Description Length',
      check: async () => {
        if (typeof window === 'undefined') return true;
        const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
        if (!metaDesc?.content) return false;
        return metaDesc.content.length >= 120 && metaDesc.content.length <= 160;
      },
      weight: 7,
      suggestion: 'Keep meta descriptions between 120-160 characters'
    },
    {
      name: 'Open Graph Tags',
      check: async () => {
        if (typeof window === 'undefined') return true;
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDescription = document.querySelector('meta[property="og:description"]');
        const ogImage = document.querySelector('meta[property="og:image"]');
        return !!(ogTitle && ogDescription && ogImage);
      },
      weight: 8,
      suggestion: 'Add Open Graph tags for better social media sharing'
    },
    {
      name: 'Twitter Card Tags',
      check: async () => {
        if (typeof window === 'undefined') return true;
        const twitterCard = document.querySelector('meta[name="twitter:card"]');
        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        return !!(twitterCard && twitterTitle);
      },
      weight: 6,
      suggestion: 'Add Twitter Card meta tags for better Twitter sharing'
    },
    {
      name: 'Structured Data',
      check: async () => {
        if (typeof window === 'undefined') return true;
        const structuredData = document.querySelector('script[type="application/ld+json"]');
        return !!structuredData;
      },
      weight: 9,
      suggestion: 'Add structured data (JSON-LD) for better search engine understanding'
    },
    {
      name: 'Canonical URL',
      check: async () => {
        if (typeof window === 'undefined') return true;
        const canonical = document.querySelector('link[rel="canonical"]');
        return !!canonical;
      },
      weight: 7,
      suggestion: 'Add canonical URLs to prevent duplicate content issues'
    },
    {
      name: 'Viewport Meta Tag',
      check: async () => {
        if (typeof window === 'undefined') return true;
        const viewport = document.querySelector('meta[name="viewport"]');
        return !!viewport;
      },
      weight: 8,
      suggestion: 'Add viewport meta tag for mobile responsiveness'
    },
    {
      name: 'Language Declaration',
      check: async () => {
        if (typeof window === 'undefined') return true;
        return document.documentElement.hasAttribute('lang');
      },
      weight: 6,
      suggestion: 'Declare the page language in the html tag'
    },
    {
      name: 'Heading Structure',
      check: async () => {
        if (typeof window === 'undefined') return true;
        const h1 = document.querySelector('h1');
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        return !!h1 && headings.length >= 3;
      },
      weight: 7,
      suggestion: 'Use proper heading hierarchy with at least one H1 and multiple heading levels'
    },
    {
      name: 'Alt Text for Images',
      check: async () => {
        if (typeof window === 'undefined') return true;
        const images = document.querySelectorAll('img');
        let hasAltText = true;
        images.forEach(img => {
          if (!img.hasAttribute('alt')) {
            hasAltText = false;
          }
        });
        return hasAltText;
      },
      weight: 6,
      suggestion: 'Add alt text to all images for accessibility and SEO'
    },
    {
      name: 'HTTPS Usage',
      check: async () => {
        if (typeof window === 'undefined') return true;
        return window.location.protocol === 'https:';
      },
      weight: 9,
      suggestion: 'Use HTTPS for security and SEO benefits'
    },
    {
      name: 'Page Loading Speed',
      check: async () => {
        if (typeof window === 'undefined') return true;
        if (!window.performance?.timing) return true;
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        return loadTime < 3000; // Less than 3 seconds
      },
      weight: 10,
      suggestion: 'Optimize page loading speed to under 3 seconds'
    }
  ];

  async performAudit(): Promise<SEOAuditResult> {
    const results = await Promise.all(
      this.checks.map(async (check) => ({
        name: check.name,
        passed: await check.check(),
        weight: check.weight,
        suggestion: check.suggestion
      }))
    );

    const totalWeight = this.checks.reduce((sum, check) => sum + check.weight, 0);
    const passedWeight = results
      .filter(result => result.passed)
      .reduce((sum, result) => sum + result.weight, 0);

    const score = Math.round((passedWeight / totalWeight) * 100);
    
    const passed = results.filter(r => r.passed).map(r => r.name);
    const failed = results.filter(r => !r.passed);
    const issues = failed.map(r => r.name);
    const suggestions = failed.map(r => r.suggestion);

    return {
      score,
      issues,
      suggestions,
      passed
    };
  }

  generateReport(result: SEOAuditResult): string {
    const report = `
SEO Audit Report
================
Overall Score: ${result.score}/100

✅ PASSED (${result.passed.length} items):
${result.passed.map(item => `  • ${item}`).join('\n')}

❌ ISSUES FOUND (${result.issues.length} items):
${result.issues.map(item => `  • ${item}`).join('\n')}

💡 SUGGESTIONS:
${result.suggestions.map((suggestion, index) => `  ${index + 1}. ${suggestion}`).join('\n')}

🏆 SEO RECOMMENDATIONS FOR GRIEF SUPPORT PLATFORM:
  • Target keywords: "grief support", "memorial conversations", "AI bereavement help"
  • Create content around emotional healing and remembrance
  • Build topical authority in grief counseling and memorial services
  • Optimize for local SEO if offering region-specific services
  • Create comprehensive FAQ content about grief and AI assistance
  • Build high-quality backlinks from grief support organizations
  • Ensure all content is compassionate and sensitive to bereaved individuals
  • Use schema markup for healthcare/mental health services
  • Create testimonials and case studies (with permission)
  • Optimize for voice search queries about grief support
    `;

    return report;
  }
}

// Utility function to run audit from anywhere
export async function runSEOAudit(): Promise<SEOAuditResult> {
  const auditor = new SEOAuditor();
  return await auditor.performAudit();
}

// Console command for quick audit
if (typeof window !== 'undefined') {
  (window as any).runSEOAudit = async () => {
    const auditor = new SEOAuditor();
    const result = await auditor.performAudit();
    console.log(auditor.generateReport(result));
    return result;
  };
} 