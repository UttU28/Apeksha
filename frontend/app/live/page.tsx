"use client";

import { ThemeProvider } from "next-themes";
import ThemeToggle from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import LiveVisualizer from "@/components/live-visualizer";

export default function LivePage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <main className="min-h-screen bg-background">
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="bg-background/20 backdrop-blur-sm hover:bg-background/30">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Live</h1>
          </div>
          <ThemeToggle />
        </div>
        
        <div className="w-full h-screen">
          <LiveVisualizer />
        </div>
      </main>
    </ThemeProvider>
  );
}