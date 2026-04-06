import { useState, useEffect, useRef, useCallback } from "react";
import type { AnimationDefinition } from "@/types/actor";
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";

interface AnimationPreviewProps {
  spriteSheetSrc: string;
  frames: AnimationDefinition[];
  loop?: boolean;
  width?: number;
  height?: number;
}

export function AnimationPreview({ spriteSheetSrc, frames, loop = false, width = 32, height = 32 }: AnimationPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const playingRef = useRef(false);
  const SCALE = 3;

  useEffect(() => {
    if (!spriteSheetSrc) return;
    const image = new Image();
    image.onload = () => setImg(image);
    image.onerror = () => setImg(null);
    image.src = spriteSheetSrc;
  }, [spriteSheetSrc]);

  const drawFrame = useCallback((colIdx: number) => {
    if (!img || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width * SCALE, height * SCALE);
    ctx.drawImage(
      img,
      colIdx * width, 0, width, height,
      0, 0, width * SCALE, height * SCALE
    );
  }, [img, width, height]);

  useEffect(() => {
    if (!playing || !img || frames.length === 0) return;
    playingRef.current = true;
    let cancelled = false;

    const animate = async () => {
      do {
        for (const frame of frames) {
          if (cancelled || !playingRef.current) return;
          drawFrame(frame.columnIdx);
          await new Promise((r) => setTimeout(r, frame.frameDurationMs));
        }
      } while (loop && !cancelled && playingRef.current);
      if (!cancelled) setPlaying(false);
    };

    animate();
    return () => { cancelled = true; playingRef.current = false; };
  }, [playing, img, frames, loop, drawFrame]);

  useEffect(() => {
    // Draw first frame when not playing
    if (!playing && img && frames.length > 0) {
      drawFrame(frames[0].columnIdx);
    }
  }, [playing, img, frames, drawFrame]);

  if (!spriteSheetSrc || frames.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <canvas
        ref={canvasRef}
        width={width * SCALE}
        height={height * SCALE}
        className="border border-border rounded bg-black/80"
        style={{ imageRendering: "pixelated" }}
      />
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs"
        onClick={() => {
          if (playing) { playingRef.current = false; setPlaying(false); }
          else setPlaying(true);
        }}
      >
        {playing ? <Square className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
        {playing ? "Stop" : "Play"}
      </Button>
    </div>
  );
}
