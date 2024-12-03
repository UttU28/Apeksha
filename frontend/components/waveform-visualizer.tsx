"use client";

import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

interface WaveformVisualizerProps {
  audioBlob: Blob;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export default function WaveformVisualizer({
  audioBlob,
  currentTime,
  duration,
  onSeek,
}: WaveformVisualizerProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!waveformRef.current || wavesurferRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#4a5568',
      progressColor: '#ffffff',
      cursorColor: '#ffffff',
      barWidth: 2,
      barGap: 2,
      height: 48,
      normalize: true,
      fillParent: true,
      barHeight: 0.5, // Only show top half
      barRadius: 2,
      interact: true,
      hideScrollbar: true,
      plugins: []
    });

    wavesurfer.loadBlob(audioBlob);

    wavesurfer.on("ready", () => {
      wavesurferRef.current = wavesurfer;
    });

    wavesurfer.on("interaction", (position) => {
      if (Number.isFinite(position) && duration > 0) {
        onSeek(position * duration);
      }
    });

    return () => {
      wavesurfer.destroy();
      wavesurferRef.current = null;
    };
  }, [audioBlob]);

  useEffect(() => {
    const wavesurfer = wavesurferRef.current;
    if (wavesurfer && Number.isFinite(currentTime) && Number.isFinite(duration) && duration > 0) {
      const position = currentTime / duration;
      if (Number.isFinite(position) && position >= 0 && position <= 1) {
        wavesurfer.seekTo(position);
      }
    }
  }, [currentTime, duration]);

  return (
    <div className="h-12 bg-black/20 rounded-lg overflow-hidden">
      <div ref={waveformRef} className="w-full h-full" />
    </div>
  );
}