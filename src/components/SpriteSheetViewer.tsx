import { useState, useEffect, useRef } from "react";

interface SpriteSheetViewerProps {
  src: string;
  onSelectColumn?: (col: number) => void;
  selectedColumns?: number[];
  label?: string;
}

export function SpriteSheetViewer({ src, onSelectColumn, selectedColumns = [], label }: SpriteSheetViewerProps) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const SPRITE_SIZE = 32;
  const SCALE = 2;

  useEffect(() => {
    if (!src) return;
    const image = new Image();
    image.onload = () => setImg(image);
    image.onerror = () => setImg(null);
    image.src = src;
  }, [src]);

  useEffect(() => {
    if (!img || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const cols = Math.floor(img.width / SPRITE_SIZE);
    const rows = Math.floor(img.height / SPRITE_SIZE);
    canvas.width = cols * SPRITE_SIZE * SCALE;
    canvas.height = rows * SPRITE_SIZE * SCALE;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw grid and column numbers
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = `${10}px monospace`;
    for (let c = 0; c < cols; c++) {
      const x = c * SPRITE_SIZE * SCALE;
      ctx.strokeRect(x, 0, SPRITE_SIZE * SCALE, canvas.height);
      ctx.fillText(String(c), x + 2, 10);
    }
    for (let r = 0; r < rows; r++) {
      ctx.strokeRect(0, r * SPRITE_SIZE * SCALE, canvas.width, SPRITE_SIZE * SCALE);
    }

    // Highlight selected columns
    for (const col of selectedColumns) {
      const x = col * SPRITE_SIZE * SCALE;
      ctx.fillStyle = "rgba(59, 130, 246, 0.3)";
      ctx.fillRect(x, 0, SPRITE_SIZE * SCALE, canvas.height);
    }
  }, [img, selectedColumns]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!img || !onSelectColumn || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const scaleX = canvasRef.current.width / rect.width;
    const col = Math.floor((x * scaleX) / (SPRITE_SIZE * SCALE));
    onSelectColumn(col);
  };

  if (!src) return null;

  return (
    <div className="space-y-1">
      {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
      {img ? (
        <div className="overflow-auto border border-border rounded bg-black/80 p-1 max-h-48">
          <canvas
            ref={canvasRef}
            onClick={handleClick}
            className={onSelectColumn ? "cursor-pointer" : ""}
            style={{ imageRendering: "pixelated" }}
          />
        </div>
      ) : (
        <p className="text-xs text-destructive">Failed to load image</p>
      )}
    </div>
  );
}

interface IconPreviewProps {
  src: string;
}

export function IconPreview({ src }: IconPreviewProps) {
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (!src) { setValid(false); return; }
    const img = new Image();
    img.onload = () => setValid(true);
    img.onerror = () => setValid(false);
    img.src = src;
  }, [src]);

  if (!src || !valid) return null;
  return (
    <img src={src} alt="icon" className="h-8 w-8 border border-border rounded" style={{ imageRendering: "pixelated" }} />
  );
}
