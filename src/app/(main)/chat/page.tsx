"use client";

export default function ChatListPage() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to Messaging App
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Select a conversation to start chatting or search for a user to begin
        </p>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>👈 Use the sidebar to:</p>
          <ul className="space-y-1 mt-3">
            <li>• Click on a user to start a direct message</li>
            <li>• Search for users by name or email</li>
            <li>• View your conversation history</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
