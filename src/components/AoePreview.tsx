interface AoePreviewProps {
  radius: number;
  minRadius: number;
  shape: "diamond" | "square" | "circle" | "cross";
}

function isInShape(dx: number, dy: number, radius: number, minRadius: number, shape: string): boolean {
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  let distance: number;
  switch (shape) {
    case "diamond":
      distance = absDx + absDy;
      break;
    case "square":
      distance = Math.max(absDx, absDy);
      break;
    case "circle":
      distance = Math.sqrt(dx * dx + dy * dy);
      break;
    case "cross":
      if (dx !== 0 && dy !== 0) return false;
      distance = absDx + absDy;
      break;
    default:
      distance = absDx + absDy;
  }

  return distance >= minRadius && distance <= radius;
}

export function AoePreview({ radius, minRadius, shape }: AoePreviewProps) {
  const gridSize = Math.max(radius, 1);
  const cells: { x: number; y: number; type: "actor" | "aoe" | "empty" }[] = [];

  for (let dy = -gridSize; dy <= gridSize; dy++) {
    for (let dx = -gridSize; dx <= gridSize; dx++) {
      if (dx === 0 && dy === 0) {
        cells.push({ x: dx, y: dy, type: "actor" });
      } else if (isInShape(dx, dy, radius, minRadius, shape)) {
        cells.push({ x: dx, y: dy, type: "aoe" });
      } else {
        cells.push({ x: dx, y: dy, type: "empty" });
      }
    }
  }

  const side = gridSize * 2 + 1;
  const cellSize = Math.min(20, Math.floor(140 / side));

  return (
    <div
      className="inline-grid gap-px bg-border rounded overflow-hidden"
      style={{
        gridTemplateColumns: `repeat(${side}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${side}, ${cellSize}px)`,
      }}
    >
      {cells.map((cell, i) => (
        <div
          key={i}
          className={
            cell.type === "actor"
              ? "bg-blue-500"
              : cell.type === "aoe"
                ? "bg-red-500"
                : "bg-muted/40"
          }
        />
      ))}
    </div>
  );
}
