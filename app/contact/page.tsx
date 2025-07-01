import SimpleNavbar from "@/components/simple-navbar";
import SimpleFooter from "@/components/simple-footer";
import { ContactForm } from '@/components/contact-form';
import Image from "next/image";

export default function ContactPage() {
  return (
    <>
      <SimpleNavbar />
      <div className="min-h-[70vh] bg-gradient-to-br from-[#fdfdfd] via-purple-50/30 to-blue-50/20 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-10 text-center">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center mx-auto mb-4">
            <Image src="/favicon.ico" alt="Contact" width={48} height={48} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-blue-700 bg-clip-text text-transparent mb-4">
            Contact SoulEcho
          </h1>
          <p className="text-base sm:text-lg text-gray-700 mb-6">
            Have questions, feedback, or need help? We&apos;d love to hear from you! Fill out the form below or email us directly at
            <a href="mailto:support@talkers.pro" className="text-purple-700 hover:underline font-medium ml-1">support@talkers.pro</a>.
          </p>
          <div className="mb-8">
            <ContactForm />
          </div>
        </div>
      </div>
      <SimpleFooter />
    </>
  );
} 