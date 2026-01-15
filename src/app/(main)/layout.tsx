"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { MainLayoutContent } from "./MainLayoutContent";

export const dynamic = 'force-dynamic';

export default function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <MainLayoutContent>{children}</MainLayoutContent>
    </ThemeProvider>
  );
}
