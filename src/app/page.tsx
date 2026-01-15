'use client';

import Link from 'next/link';
import { MessageCircle, Users, Zap } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

export default function Home() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-5 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-gray-900">
          KONEKSYON
        </div>
        <div className="flex gap-3">
          {isSignedIn ? (
            <Link
              href="/chat"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium"
            >
              Go to Chat
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-6 py-2.5 text-gray-700 hover:text-emerald-600 transition font-medium"
              >
                Sign In
              </Link> 
              <Link
                href="/sign-up"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center px-6 py-20 max-w-5xl mx-auto">
        {/* Icon Network Visualization */}
        <div className="relative w-full max-w-2xl h-48 mb-12">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="absolute top-8 left-16 w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-md">
            <Zap className="w-8 h-8 text-white" />
          </div>
          
          <div className="absolute top-12 right-20 w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center shadow-md">
            <Users className="w-8 h-8 text-white" />
          </div>
          
          <div className="absolute bottom-12 left-28 w-14 h-14 bg-blue-400 rounded-2xl flex items-center justify-center shadow-md">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          
          <div className="absolute bottom-8 right-32 w-14 h-14 bg-purple-400 rounded-2xl flex items-center justify-center shadow-md">
            <Users className="w-7 h-7 text-white" />
          </div>

          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
            <line x1="30%" y1="25%" x2="50%" y2="50%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="4,4" />
            <line x1="70%" y1="30%" x2="50%" y2="50%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="4,4" />
            <line x1="35%" y1="75%" x2="50%" y2="50%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="4,4" />
            <line x1="65%" y1="70%" x2="50%" y2="50%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="4,4" />
          </svg>
        </div>

        <div className="text-center max-w-3xl mx-auto">
          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            All-in-one messaging platform
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            KONEKSYON is a modern messaging platform designed to perfectly fit your communication needs
          </p>

          {/* CTA Button */}
          <div className="mb-16">
            {isSignedIn ? (
              <Link
                href="/chat"
                className="inline-block px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-lg transition shadow-lg"
              >
                Go to Chat
              </Link>
            ) : (
              <Link
                href="/sign-up"
                className="inline-block px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-lg transition shadow-lg"
              >
                Request a Demo
              </Link>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-2 text-lg">Direct Messages</h3>
              <p className="text-gray-600 text-sm">Chat one-on-one with friends in real-time</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-2 text-lg">Group Chats</h3>
              <p className="text-gray-600 text-sm">Create groups and chat with multiple people at once</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-2 text-lg">Lightning Fast</h3>
              <p className="text-gray-600 text-sm">Instant messaging with real-time typing indicators</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 border-t border-gray-200 mt-20">
        <p>© 2026 KONEKSYON. Connect with everyone.</p>
      </footer>
    </div>
  );
}