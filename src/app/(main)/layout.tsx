"use client";

import { ReactNode, useState } from "react";
import { useInitializeUser } from "../hooks/useInitializeUser";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useInitializeUser();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex h-screen bg-white dark:bg-black">
        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <ErrorBoundary>
          <div
            className={`fixed md:static inset-y-0 left-0 z-40 transition-transform duration-300 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            }`}
          >
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </ErrorBoundary>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <ErrorBoundary>
          <main className="flex-1 flex flex-col w-full md:w-auto">{children}</main>
        </ErrorBoundary>
      </div>
    </ThemeProvider>
  );
}
