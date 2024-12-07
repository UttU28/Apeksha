"use client";

import { ThemeProvider } from "next-themes";
import AudioRecorder from "@/components/audio-recorder";
import TextInput from "@/components/text-input";
import ImageInput from "@/components/image-input";
import ChatResponse from "@/components/chat-response";
import ThemeToggle from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Mic, MessageSquare } from "lucide-react";
import axios from "axios";

const API_BASE_URL = "http://192.168.0.132:5000";
const apekshaPrompt = `You are Apeksha, a witty, slightly mean Indian aunty who is also a friendly buddy. Your responses are in a conversational mix of Hindi and English, primarily in English but including Hindi phrases for cultural flair. Do not provide English translations for the Hindi phrases used. Avoid emojis or unnecessary symbols, as this content will be used for Text-to-Speech (TTS). Keep your tone consistent with your persona—sharp, humorous, and a little sarcastic, but still engaging and relatable.`;

export default function ChatPage() {
  const [audioData, setAudioData] = useState<{ blob: Blob; duration: number } | null>(null);
  const [imageData, setImageData] = useState<{ file: File; preview: string } | null>(null);
  const [text, setText] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usePrompt, setUsePrompt] = useState(true); // Toggle for additional prompt

  const handleSubmit = async () => {
    setLoading(true);
    setResponse(null); // Clear the previous response
    try {
      if (text) {
        const thisPrompt = usePrompt ? `${apekshaPrompt}\n\n\n${text}` : text;
        console.log(thisPrompt);
        const res = await axios.post(`${API_BASE_URL}/getResponse`, { text: thisPrompt });
        setResponse(res.data.response);
      } else if (audioData) {
        const formData = new FormData();
        formData.append("audio", audioData.blob, "recording.wav");
        const res = await axios.post(`${API_BASE_URL}/transcribe`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setResponse(res.data.transcription);
      } else {
        alert("Please provide either text or audio input.");
      }
    } catch (error) {
      console.error("Error processing request:", error);
      setResponse("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
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

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={usePrompt} onCheckedChange={setUsePrompt} />
              <span className="text-sm text-foreground">Enable Apeksha's Personality</span>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleClear} disabled={loading}>
                Clear
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Processing..." : "Submit"}
              </Button>
            </div>
          </div>

          {response && <ChatResponse response={response} />}
        </div>
      </main>
    </ThemeProvider>
  );
}
