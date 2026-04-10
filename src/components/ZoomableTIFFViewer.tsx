import React, { useRef, useState, useCallback } from "react";
import { TIFFViewer } from "react-tiff";
import "react-tiff/dist/index.css";

interface ZoomableTIFFViewerProps {
  tiff: string;
}

const MIN_SCALE = 0.1;
const MAX_SCALE = 10;
const ZOOM_STEP = 0.25;

export default function ZoomableTIFFViewer({ tiff }: ZoomableTIFFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Wheel zoom centered on cursor position
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setScale(
      (s) => +Math.min(MAX_SCALE, Math.max(MIN_SCALE, s + delta)).toFixed(2),
    );
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const stopDrag = () => setIsDragging(false);

  const zoomIn = () =>
    setScale((s) => +Math.min(MAX_SCALE, s + ZOOM_STEP).toFixed(2));
  const zoomOut = () =>
    setScale((s) => +Math.max(MIN_SCALE, s - ZOOM_STEP).toFixed(2));
  const reset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gap: 8,
      }}
    >
      {/* ── Toolbar ── */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={zoomOut} disabled={scale <= MIN_SCALE}>
          −
        </button>
        <span style={{ fontSize: 13, minWidth: 52, textAlign: "center" }}>
          {Math.round(scale * 100)}%
        </span>
        <button onClick={zoomIn} disabled={scale >= MAX_SCALE}>
          +
        </button>
        <button onClick={reset}>Reset</button>
      </div>

      {/* ── Viewport ── */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        style={{
          flex: 1,
          overflow: "hidden",
          cursor: isDragging ? "grabbing" : "grab",
          background: "#e8e8e8",
          borderRadius: 8,
          userSelect: "none",
        }}
      >
        {/* Inner div carries the transform so TIFFViewer is untouched */}
        <div
          style={{
            transformOrigin: "top left",
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transition: isDragging ? "none" : "transform 0.1s ease",
            display: "inline-block", // shrink-wrap around the TIFF canvas
          }}
        >
          <TIFFViewer tiff={tiff} zoomable paginate="ltr" />
        </div>
      </div>
    </div>
  );
}
