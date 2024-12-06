"use client";

import { ThemeProvider } from "next-themes";
import { Card } from "@/components/ui/card";
import ThemeToggle from "@/components/theme-toggle";
import Link from "next/link";
import { MessageSquare, Radio, Car, Globe, Languages, ListTodo } from "lucide-react";
export default function Home() {
  const menuItems = [
    {
      title: "Chat",
      icon: <MessageSquare className="h-12 w-12" />,
      href: "/chat",
      description: "Start a conversation with Apeksha",
    },
    {
      title: "Live",
      icon: <Radio className="h-12 w-12" />,
      href: "/live",
      description: "Join live sessions",
    },
    {
      title: "Ashwathama",
      icon: <Car className="h-12 w-12" />,
      href: "/ashwathama",
      description: "Car interface and controls",
    },
    {
      title: "Browser",
      icon: <Globe className="h-12 w-12" />,
      href: "/browser",
      description: "Web browsing interface",
    },
    {
      title: "Bhasini",
      icon: <Languages className="h-12 w-12" />,
      href: "/bhasini",
      description: "Language translation",
    },
    {
      title: "To-Do",
      icon: <ListTodo className="h-12 w-12" />,
      href: "/todo",
      description: "Manage your Shopping Lists",
    },
  ];

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-foreground">Apeksha Dashboard</h1>
            <ThemeToggle />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <Link href={item.href} key={item.title}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                      {item.icon}
                    </div>
                    <h2 className="text-2xl font-semibold">{item.title}</h2>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </ThemeProvider>
  );
}