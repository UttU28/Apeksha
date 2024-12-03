"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface ImageInputProps {
  onImageSelected: (imageData: { file: File; preview: string } | null) => void;
  imageData: { file: File; preview: string } | null;
}

export default function ImageInput({ onImageSelected, imageData }: ImageInputProps) {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected({
          file,
          preview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    onImageSelected(null);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <Label>Upload Image</Label>
        {imageData ? (
          <div className="relative">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={imageData.preview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-primary/5">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
        )}
      </div>
    </Card>
  );
}