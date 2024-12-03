"use client";

import { ThemeProvider } from "next-themes";
import AudioRecorder from "@/components/audio-recorder";
import TextInput from "@/components/text-input";
import ImageInput from "@/components/image-input";
import ChatResponse from "@/components/chat-response";
import ThemeToggle from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Mic, MessageSquare } from "lucide-react";

const exampleResponse = `\`\`\`python
# Function to add two numbers
def add_numbers(a, b):
    """
    This function takes two arguments a and b,
    and returns their sum.
    """
    return a + b

# Example usage
number1 = 5
number2 = 7
result = add_numbers(number1, number2)
print(f"The sum of {number1} and {number2} is {result}")
\`\`\`

### Explanation:
1. **Defining the Function**:
   - The function \`add_numbers\` is defined with two parameters, \`a\` and \`b\`.
   - The \`return\` statement calculates the sum of \`a\` and \`b\` and sends it back to the caller.

2. **Using the Function**:
   - \`number1\` and \`number2\` are assigned values \`5\` and \`7\` respectively.
   - The function is called with \`number1\` and \`number2\` as arguments: \`add_numbers(number1, number2)\`.
   - The result of the function is stored in the variable \`result\`.

3. **Output**:
   - The program uses \`print()\` to display the result, showing the addition operation and its result.`;

export default function ChatPage() {
  const [audioData, setAudioData] = useState<{ blob: Blob; duration: number } | null>(null);
  const [imageData, setImageData] = useState<{ file: File; preview: string } | null>(null);
  const [text, setText] = useState("");
  const [response, setResponse] = useState<string | null>(null);

  const handleSubmit = () => {
    if (imageData) {
      console.log("Image uploaded:", {
        filename: imageData.file.name,
        size: `${(imageData.file.size / 1024).toFixed(2)} KB`
      });
    }
    if (audioData) {
      console.log("Audio duration:", audioData.duration, "seconds");
    }
    if (text) {
      console.log("Text input:", text);
    }
    setResponse(exampleResponse);
  };

  const handleClear = () => {
    setImageData(null);
    setAudioData(null);
    setText("");
    setResponse(null);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-foreground">Oye Apekshaa...</h1>
            </div>
            <ThemeToggle />
          </div>

          <ImageInput onImageSelected={setImageData} imageData={imageData} />

          <Tabs defaultValue="audio" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="audio" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Audio
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Text
              </TabsTrigger>
            </TabsList>
            <TabsContent value="audio" className="mt-4">
              <AudioRecorder onAudioRecorded={setAudioData} audioData={audioData} />
            </TabsContent>
            <TabsContent value="text" className="mt-4">
              <TextInput value={text} onChange={setText} />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <Button onClick={handleSubmit}>Submit</Button>
          </div>

          {response && (
            <ChatResponse response={response} />
          )}
        </div>
      </main>
    </ThemeProvider>
  );
}