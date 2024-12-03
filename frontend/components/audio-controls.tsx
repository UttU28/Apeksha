"use client";

import { Button } from "@/components/ui/button";
import { Play, Pause, Download, RotateCcw } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface AudioControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onDownload: () => void;
  onReRecord: () => void;
}

export default function AudioControls({
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onDownload,
  onReRecord,
}: AudioControlsProps) {
  return (
    <div className="flex items-center justify-between gap-2 mt-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onPlayPause}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </Button>
      
      <div className="text-sm text-muted-foreground">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onDownload}
        >
          <Download size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onReRecord}
        >
          <RotateCcw size={16} />
        </Button>
      </div>
    </div>
  );
}