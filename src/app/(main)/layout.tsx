"use client";

import { ReactNode } from "react";
import { useInitializeUser } from "../hooks/useInitializeUser";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

export default function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  useInitializeUser();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex h-screen bg-white dark:bg-black">
        <ErrorBoundary>
          <Sidebar />
        </ErrorBoundary>
        <ErrorBoundary>
          <main className="flex-1 flex flex-col">{children}</main>
        </ErrorBoundary>
      </div>
    </ThemeProvider>
  );
}
