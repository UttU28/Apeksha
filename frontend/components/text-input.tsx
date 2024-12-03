"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TextInput({ value, onChange }: TextInputProps) {
  return (
    <Card className="p-6 h-[200px]">
      <div className="h-full flex flex-col">
        <Label htmlFor="text" className="mb-2">Enter your text here</Label>
        <Textarea
          id="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 resize-none"
          placeholder="Type your message..."
        />
      </div>
    </Card>
  );
}