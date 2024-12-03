"use client";

import { ThemeProvider } from "next-themes";
import ThemeToggle from "@/components/theme-toggle";
import BrowserForm from "@/components/browser-form";
import BrowserCards from "@/components/browser-cards";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export interface BrowserLink {
  id: string;
  alias: string;
  url: string;
  port?: string;
  protocol: "http" | "https";
}

export default function BrowserPage() {
  const [links, setLinks] = useState<BrowserLink[]>([]);
  const [editingLink, setEditingLink] = useState<BrowserLink | null>(null);

  const handleAddLink = (link: BrowserLink) => {
    if (editingLink) {
      setLinks(prev => prev.map(l => l.id === editingLink.id ? link : l));
      setEditingLink(null);
    } else {
      setLinks(prev => [...prev, link]);
    }
  };

  const handleEdit = (link: BrowserLink) => {
    setEditingLink(link);
  };

  const handleDelete = (id: string) => {
    setLinks(prev => prev.filter(link => link.id !== id));
  };

  const handleCancelEdit = () => {
    setEditingLink(null);
  };

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
              <h1 className="text-3xl font-bold text-foreground">Browser</h1>
            </div>
            <ThemeToggle />
          </div>

          <BrowserForm 
            onSubmit={handleAddLink} 
            editingLink={editingLink}
            onCancelEdit={handleCancelEdit}
          />
          <BrowserCards 
            links={links} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </main>
    </ThemeProvider>
  );
}