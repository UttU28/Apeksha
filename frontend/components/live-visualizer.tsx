"use client";

import { useEffect, useRef, useState } from "react";

export default function LiveVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const previousDataRef = useRef<number[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        
        analyserRef.current.fftSize = 2048;
        analyserRef.current.smoothingTimeConstant = 0.94; // Increased smoothing
        
        startVisualization();
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    };

    setupAudio();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startVisualization = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    let time = 0;
    
    const draw = () => {
      if (!isActive) return;
      
      time += 0.001; // Slower base animation
      animationFrameRef.current = requestAnimationFrame(draw);
      analyserRef.current!.getByteFrequencyData(dataArray);

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) * 0.8;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Smooth the data
      const smoothedData = Array.from(dataArray).map((value, i) => {
        const prev = previousDataRef.current[i] || 0;
        return prev * 0.8 + value * 0.2; // Smoother transitions
      });
      previousDataRef.current = smoothedData;

      const intensity = smoothedData.reduce((sum, value) => sum + value, 0) / 
                       (smoothedData.length * 255);

      const numRings = 4;
      const baseHue = 200;
      
      // Draw ghost shadows
      for (let ghost = 2; ghost >= 0; ghost--) {
        const ghostOffset = ghost * 0.15;
        
        for (let ring = 0; ring < numRings; ring++) {
          const ringRadius = radius * (0.4 + ring * 0.15);
          const segments = 180;
          const angleStep = (Math.PI * 2) / segments;
          
          ctx.beginPath();
          for (let i = 0; i <= segments; i++) {
            const angle = i * angleStep;
            const freqIndex = Math.floor((i / segments) * smoothedData.length * 0.5);
            const value = (smoothedData[freqIndex] / 255) || 0.1; // Minimum value for idle animation
            
            // Idle animation components
            const idleWave = Math.sin(time * 0.5 + ring * 0.8 + angle * 2) * 5;
            const breathingEffect = Math.sin(time * 0.3 + ring * 0.4) * 3;
            const rotationOffset = Math.sin(time * 0.2 + ring * 0.5) * 0.1;
            
            // Combine audio reactivity with idle animations
            const displacement = (value * 35 + idleWave) * 
              Math.sin(time * 1.2 - ghostOffset + ring * 0.3) * 
              Math.cos(angle * 2 + time + rotationOffset);
            
            const r = ringRadius + displacement * (ring + 1) * 0.4 + breathingEffect;
            
            const x = centerX + Math.cos(angle + rotationOffset) * r;
            const y = centerY + Math.sin(angle + rotationOffset) * r;
            
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }

          const ghostAlpha = (0.12 - ghost * 0.03) * (intensity + 0.2);
          ctx.strokeStyle = `hsla(${baseHue}, 90%, 60%, ${ghostAlpha})`;
          ctx.lineWidth = 2 + (intensity + 0.1) * 3;
          ctx.stroke();

          ctx.shadowBlur = 15;
          ctx.shadowColor = `hsla(${baseHue}, 90%, 60%, ${(intensity + 0.1) * 0.3})`;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      // Main visualization
      for (let ring = 0; ring < numRings; ring++) {
        const ringRadius = radius * (0.4 + ring * 0.15);
        const segments = 180;
        const angleStep = (Math.PI * 2) / segments;
        
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
          const angle = i * angleStep;
          const freqIndex = Math.floor((i / segments) * smoothedData.length * 0.5);
          const value = (smoothedData[freqIndex] / 255) || 0.1;
          
          // Enhanced idle animations
          const idleWave = Math.sin(time * 0.5 + ring * 0.8 + angle * 2) * 5;
          const breathingEffect = Math.sin(time * 0.3 + ring * 0.4) * 3;
          const rotationOffset = Math.sin(time * 0.2 + ring * 0.5) * 0.1;
          
          const displacement = (value * 35 + idleWave) * 
            Math.sin(time * 1.2 + ring * 0.3) * 
            Math.cos(angle * 2 + time + rotationOffset);
          
          const r = ringRadius + displacement * (ring + 1) * 0.4 + breathingEffect;
          
          const x = centerX + Math.cos(angle + rotationOffset) * r;
          const y = centerY + Math.sin(angle + rotationOffset) * r;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        const alpha = 0.35 + (intensity + 0.1) * 0.65;
        ctx.strokeStyle = `hsla(${baseHue}, 90%, 60%, ${alpha})`;
        ctx.lineWidth = 2.5 + (intensity + 0.1) * 3;
        ctx.stroke();

        ctx.shadowBlur = 20;
        ctx.shadowColor = `hsla(${baseHue}, 90%, 60%, ${(intensity + 0.1) * 0.5})`;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Enhanced center pulse with idle animation
      const pulseSize = 0.15 + (intensity + 0.1) * 0.15 + Math.sin(time * 0.8) * 0.02;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * pulseSize, 0, Math.PI * 2);
      const centerGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius * pulseSize
      );
      centerGradient.addColorStop(0, `hsla(${baseHue}, 90%, 60%, ${0.15 + (intensity + 0.1) * 0.3})`);
      centerGradient.addColorStop(1, `hsla(${baseHue}, 90%, 60%, 0)`);
      ctx.fillStyle = centerGradient;
      ctx.fill();
    };

    draw();
  };

  return (
    <div className="fixed inset-0 bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
}