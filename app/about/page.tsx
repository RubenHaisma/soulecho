"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import SimpleNavbar from "@/components/simple-navbar";
import SimpleFooter from "@/components/simple-footer";

export default function AboutPage() {
  return (
    <>
      <SimpleNavbar />
      <div className="min-h-[70vh] bg-gradient-to-br from-[#fdfdfd] via-purple-50/30 to-blue-50/20 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-white">💬</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-blue-700 bg-clip-text text-transparent mb-4">
            About SoulEcho
          </h1>
          <p className="text-base sm:text-lg text-gray-700 mb-6">
            SoulEcho is your sacred space for meaningful conversations. We help you preserve, reflect, and grow from your most important chats—whether with friends, family, or yourself. Our mission is to empower you to cherish memories, track emotional journeys, and celebrate milestones, all in a private and beautiful environment.
          </p>
          <p className="text-base text-gray-600 mb-8">
            Built with love, privacy, and your well-being in mind. Join us in making every conversation count.
          </p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full px-6 py-2 text-base font-semibold shadow-lg">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
      <SimpleFooter />
    </>
  );
} 