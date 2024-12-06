"use client";

import { ThemeProvider } from "next-themes";
import ThemeToggle from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import StoreList from "@/components/store-list";

export default function TodoPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-foreground">To-Do</h1>
            </div>
            <ThemeToggle />
          </div>
          
          <StoreList />
        </div>
      </main>
    </ThemeProvider>
  );
}