"use client";

export function MessageSkeleton() {
  return (
    <div className="space-y-4 p-4 w-full max-w-2xl">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
          <div className="flex-1">
            <div className="w-24 h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2 animate-pulse" />
            <div className="w-48 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
