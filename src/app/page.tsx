'use client';

import Link from 'next/link';
import { MessageCircle, Users, Zap } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

export default function Home() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 dark:from-black dark:via-orange-950 dark:to-black">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto">
        <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
          KONEKSYON
        </div>
        <div className="flex gap-4">
          {isSignedIn ? (
            <Link
              href="/chat"
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Go to Chat
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-6 py-2 text-white hover:text-orange-400 transition"
              >
                Sign In
              </Link> 
              <Link
                href="/sign-up"
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          {/* Logo/Title */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-orange-400">
            KONEKSYON
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Connect instantly with your friends and groups. Share moments, start conversations, and stay close to the people that matter.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
            <div className="p-6 rounded-lg bg-white/5 backdrop-blur border border-white/10 hover:border-orange-500/50 transition">
              <MessageCircle className="w-8 h-8 text-orange-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Direct Messages</h3>
              <p className="text-gray-400 text-sm">Chat one-on-one with friends in real-time</p>
            </div>

            <div className="p-6 rounded-lg bg-white/5 backdrop-blur border border-white/10 hover:border-purple-500/50 transition">
              <Users className="w-8 h-8 text-red-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Group Chats</h3>
              <p className="text-gray-400 text-sm">Create groups and chat with multiple people at once</p>
            </div>

            <div className="p-6 rounded-lg bg-white/5 backdrop-blur border border-white/10 hover:border-pink-500/50 transition">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-400 text-sm">Instant messaging with real-time typing indicators</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            {isSignedIn ? (
              <Link
                href="/chat"
                className="px-8 py-4 bg-gradient-to-r  from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-700 text-white rounded-lg font-semibold text-lg transition transform hover:scale-105"
              >
                Go to Chat
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-700 text-white rounded-lg font-semibold text-lg transition transform hover:scale-105"
                >
                  Get Started
                </Link>
                <Link
                  href="/sign-in"
                  className="px-8 py-4 border-2 border-white/30 hover:border-white/50 text-white rounded-lg font-semibold text-lg transition"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-400 border-t border-white/10">
        <p>© 2026 KONEKSYON. Connect with everyone.</p>
      </footer>
    </div>
  );
}
