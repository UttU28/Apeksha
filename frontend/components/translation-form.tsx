"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languages = [
  { value: "hindi", label: "Hindi" },
  { value: "marathi", label: "Marathi" },
  { value: "gujarati", label: "Gujarati" },
  { value: "telugu", label: "Telugu" },
  { value: "bengali", label: "Bengali" },
  { value: "tamil", label: "Tamil" },
  { value: "kannada", label: "Kannada" },
  { value: "punjabi", label: "Punjabi" },
];

interface Translation {
  id: string;
  inputText: string;
  selectedLanguage: string;
  translation: string;
}

export default function TranslationForm() {
  const [inputText, setInputText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [translations, setTranslations] = useState<Translation[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Input text:", inputText);
    console.log("Selected language:", selectedLanguage);
    
    const newTranslation: Translation = {
      id: Date.now().toString(),
      inputText,
      selectedLanguage,
      translation: "कॉल करने के लिए यहां भैसिनी एपीआई को कॉल करें। तुम मूर्ख।"
    };
    
    setTranslations(prev => [...prev, newTranslation]);
    setInputText("");
    setSelectedLanguage("");
  };

  const handleClearAll = () => {
    setTranslations([]);
  };

  const handleDelete = (id: string) => {
    setTranslations(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to translate..."
            className="min-h-[100px]"
            required
          />
          <div className="flex gap-4">
            <Select
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
              required
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="flex-1">
              Translate
            </Button>
          </div>
        </form>
      </Card>

      {translations.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleClearAll}>
              Clear All
            </Button>
          </div>
          
          <div className="space-y-4">
            {translations.map((item) => (
              <Card key={item.id} className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-4 flex-1">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Original Text:</p>
                      <p className="text-sm">{item.inputText}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Translation ({
                        languages.find(l => l.value === item.selectedLanguage)?.label
                      }):</p>
                      <p className="text-lg font-medium">{item.translation}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}