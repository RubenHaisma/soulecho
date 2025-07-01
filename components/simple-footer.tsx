import Link from "next/link";

export default function SimpleFooter() {
  return (
    <footer className="w-full bg-gradient-to-t from-purple-50 via-blue-50 to-transparent py-6 px-4 text-center text-sm text-gray-500 mt-12">
      <div className="mb-2">
        &copy; {new Date().getFullYear()} SoulEcho. All rights reserved.
      </div>
      <Link href="/" className="text-purple-700 hover:underline font-medium">Back to Home</Link>
    </footer>
  );
} 