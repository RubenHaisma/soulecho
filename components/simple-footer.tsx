import Link from "next/link";

const blogLinks = [
  { href: "/blog", label: "Blog Home" },
  { href: "/blog/digital-grief-healing-guide-2024", label: "Digital Grief Healing Guide 2024" },
  { href: "/blog/getting-started-guide", label: "Getting Started Guide" },
  { href: "/blog/reconnect-with-loved-ones", label: "Reconnect with Loved Ones" },
  { href: "/blog/psychology-digital-memory-preservation", label: "Psychology of Digital Memory" },
  { href: "/blog/creating-digital-legacy-guide", label: "Digital Legacy Guide" },
  { href: "/blog/whatsapp-conversations-emotional-value", label: "WhatsApp Conversations Value" },
  { href: "/blog/grief-digital-age-technology-comfort", label: "Grief in the Digital Age" },
  { href: "/blog/science-emotional-memory-triggers", label: "Science of Memory Triggers" },
  { href: "/blog/faq", label: "FAQ" },
  { href: "/blog/resources", label: "Resources Hub" },
];

export default function SimpleFooter() {
  return (
    <footer className="w-full bg-gradient-to-t from-purple-50 via-blue-50 to-transparent py-6 px-4 text-center text-sm text-gray-500 mt-12">
      <div className="mb-2">
        &copy; {new Date().getFullYear()} Talkers. All rights reserved.
      </div>
      <div className="flex flex-wrap justify-center gap-3 mb-2">
        {blogLinks.map((link) => (
          <Link key={link.href} href={link.href} className="text-purple-700 hover:underline font-medium">
            {link.label}
          </Link>
        ))}
      </div>
      <Link href="/" className="text-purple-700 hover:underline font-medium">Back to Home</Link>
    </footer>
  );
} 