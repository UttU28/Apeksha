"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import type { BrowserLink } from "@/app/browser/page";

interface BrowserCardsProps {
  links: BrowserLink[];
  onEdit: (link: BrowserLink) => void;
  onDelete: (id: string) => void;
}

export default function BrowserCards({ links, onEdit, onDelete }: BrowserCardsProps) {
  const getFullUrl = (link: BrowserLink) => {
    const baseUrl = `${link.protocol}://${link.url}`;
    return link.port ? `${baseUrl}:${link.port}` : baseUrl;
  };

  const handleOpenLink = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {links.map((link) => {
        const fullUrl = getFullUrl(link);
        return (
          <Card key={link.id} className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{link.alias}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {link.protocol}://{link.url}{link.port ? `:${link.port}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => handleOpenLink(fullUrl)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Link
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(link)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDelete(link.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}