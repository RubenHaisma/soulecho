import Link from "next/link";
import Image from "next/image";

export default function SimpleNavbar() {
  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-40">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-400 to-blue-400">
          <Image
            src="/favicon.ico"
            alt="Talkers Logo"
            className="w-7 h-7 object-contain"
            width={28}
            height={28} 
          />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-blue-700 bg-clip-text text-transparent">Talkers</span>
      </Link>
      <div className="flex gap-4 text-sm font-medium">
        <Link href="/about" className="text-gray-700 hover:text-purple-700 transition-colors">About</Link>
        <Link href="/contact" className="text-gray-700 hover:text-purple-700 transition-colors">Contact</Link>
        <Link href="/privacy" className="text-gray-700 hover:text-purple-700 transition-colors">Privacy</Link>
      </div>
    </nav>
  );
} 