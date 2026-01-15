"use client";

import React from 'react';
import Image from 'next/image';
import { Users, Search, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ChatListPage() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="text-center max-w-2xl">
        {/* Icon */}
        <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Image 
            src="/koneksyon.svg" 
            alt="KONEKSYON" 
            width={40} 
            height={40}
            className="w-10 h-10 rounded-1xl"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Welcome to KONEKSYON
        </h1>
        
        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
          Select a conversation or start a new chat to connect with others
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Start a Chat
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click "New Chat" to start a direct message with any user
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Create a Group
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Use "Create Group" to chat with multiple people at once
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Search Users
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Find people by searching their name or email address
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-500/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <p className="text-sm text-emerald-500 dark:text-emerald-200">
          <span className="font-medium">Tip:</span> Your conversations will appear in the sidebar once you start chatting
          </p>
        </div>
      </div>
    </div>
  );
}