"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BrowserLink } from "@/app/browser/page";

interface BrowserFormProps {
  onSubmit: (link: BrowserLink) => void;
  editingLink: BrowserLink | null;
  onCancelEdit: () => void;
}

const initialFormData = {
  alias: "",
  url: "",
  port: "",
  protocol: "http" as const,
};

export default function BrowserForm({ onSubmit, editingLink, onCancelEdit }: BrowserFormProps) {
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (editingLink) {
      setFormData(editingLink);
    } else {
      setFormData(initialFormData);
    }
  }, [editingLink]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: editingLink?.id || Date.now().toString(),
      ...formData,
    });
    setFormData(initialFormData);
  };

  const handleClear = () => {
    setFormData(initialFormData);
    if (editingLink) {
      onCancelEdit();
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <Input
            value={formData.alias}
            onChange={(e) => setFormData((prev) => ({ ...prev, alias: e.target.value }))}
            placeholder="Alias Name"
            required
          />
          <div className="flex gap-2">
            <Select
              value={formData.protocol}
              onValueChange={(value: "http" | "https") =>
                setFormData((prev) => ({ ...prev, protocol: value }))
              }
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="http">HTTP</SelectItem>
                <SelectItem value="https">HTTPS</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={formData.url}
              onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
              placeholder="URL or IP"
              required
              className="flex-1"
            />
            <Input
              value={formData.port}
              onChange={(e) => setFormData((prev) => ({ ...prev, port: e.target.value }))}
              type="number"
              min="1"
              max="65535"
              placeholder="Port"
              className="w-[100px]"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClear}>
            {editingLink ? "Cancel" : "Clear"}
          </Button>
          <Button type="submit">
            {editingLink ? "Update" : "Add Link"}
          </Button>
        </div>
      </form>
    </Card>
  );
}