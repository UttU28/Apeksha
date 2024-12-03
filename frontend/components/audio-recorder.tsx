"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Square } from "lucide-react";
import WaveformVisualizer from "./waveform-visualizer";
import AudioControls from "./audio-controls";

interface AudioRecorderProps {
  onAudioRecorded: (data: { blob: Blob; duration: number } | null) => void;
  audioData: { blob: Blob; duration: number } | null;
}

export default function AudioRecorder({ onAudioRecorded, audioData }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [actualDuration, setActualDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) audioRef.current.pause();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (audioData?.blob && audioRef.current) {
      const url = URL.createObjectURL(audioData.blob);
      audioRef.current.src = url;
      
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      audioData.blob.arrayBuffer().then(arrayBuffer => {
        if (audioContextRef.current) {
          audioContextRef.current.decodeAudioData(arrayBuffer).then(audioBuffer => {
            const preciseDuration = audioBuffer.duration;
            setActualDuration(preciseDuration);
            onAudioRecorded({ ...audioData, duration: preciseDuration });
          });
        }
      });

      return () => URL.revokeObjectURL(url);
    }
  }, [audioData?.blob, onAudioRecorded]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        onAudioRecorded({ blob: audioBlob, duration: elapsedTime });
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setElapsedTime(0);

      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && Number.isFinite(audioRef.current.currentTime)) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current && Number.isFinite(time)) {
      const clampedTime = Math.max(0, Math.min(time, actualDuration));
      audioRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }
  };

  const handleDownload = () => {
    if (audioData) {
      const url = URL.createObjectURL(audioData.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recording.wav";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReRecord = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onAudioRecorded(null);
    setElapsedTime(0);
    setCurrentTime(0);
    setActualDuration(0);
    setIsPlaying(false);
  };

  return (
    <Card className="p-4 h-[200px] flex flex-col">
      {audioData ? (
        <div className="flex flex-col flex-1">
          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
          />
          <WaveformVisualizer
            audioBlob={audioData.blob}
            currentTime={currentTime}
            duration={actualDuration}
            onSeek={handleSeek}
          />
          <AudioControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={actualDuration}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
            onDownload={handleDownload}
            onReRecord={handleReRecord}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1">
          <Button
            variant={isRecording ? "destructive" : "default"}
            size="lg"
            className="w-[200px]"
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? (
              <>
                <Square className="mr-2 h-4 w-4" /> Stop Recording
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" /> Start Recording
              </>
            )}
          </Button>
          {isRecording && (
            <span className="text-sm text-muted-foreground mt-2">
              Recording: {elapsedTime}s
            </span>
          )}
        </div>
      )}
    </Card>
  );
}