import { ContactForm } from '@/components/contact-form';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                         Have questions about Talkers? Need help with your account? We&apos;re here to help!
          </p>
        </div>
        
        <ContactForm />
        
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            You can also reach us directly at{' '}
            <a href="mailto:support@talkers.pro" className="text-primary hover:underline">
              support@talkers.pro
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 