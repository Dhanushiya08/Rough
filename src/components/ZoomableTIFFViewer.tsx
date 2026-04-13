import React, { useRef, useState, useCallback, useEffect } from "react";
import { TIFFViewer } from "react-tiff";
import "react-tiff/dist/index.css";

const MIN_SCALE = 0.5;
const MAX_SCALE = 5;
const ZOOM_STEP = 0.25;

type TiffControls = {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  scale: number;
};

interface Props {
  tiff: string;
  onZoomChange?: (controls: TiffControls) => void;
}

export default function ZoomableTIFFViewer({ tiff, onZoomChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dragStart = useRef({ x: 0, y: 0 });
  useEffect(() => {
    setIsLoading(true);
  }, [tiff]);
  const clampPan = (x: number, y: number, currentScale = scale) => {
    if (!containerRef.current || !contentRef.current) return { x, y };

    const container = containerRef.current;
    const content = contentRef.current;

    const scaledWidth = content.offsetWidth * currentScale;
    const scaledHeight = content.offsetHeight * currentScale;

    const maxX = Math.max(0, (scaledWidth - container.clientWidth) / 2);
    const maxY = Math.max(0, (scaledHeight - container.clientHeight) / 2);

    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  };

  const zoomIn = () => setScale((s) => Math.min(MAX_SCALE, s + ZOOM_STEP));
  const zoomOut = () => setScale((s) => Math.max(MIN_SCALE, s - ZOOM_STEP));
  const reset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    setPan((prev) => clampPan(prev.x, prev.y, scale));
    onZoomChange?.({ zoomIn, zoomOut, reset, scale });
  }, [scale]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setScale((s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s + delta)));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const newPan = {
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    };

    setPan(clampPan(newPan.x, newPan.y));
  };

  const stopDrag = () => setIsDragging(false);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg overflow-hidden"
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      {" "}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 z-10 gap-3">
          <div className="w-10 h-10 border-4  border-secondary rounded-full animate-spin" />
          <span className="text-sm text-primary">Loading image...</span>
        </div>
      )}
      <div
        ref={contentRef}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: "center",
          transition: isDragging ? "none" : "transform 0.1s ease",
        }}
      >
        <TIFFViewer tiff={tiff} onLoad={() => setIsLoading(false)} />
      </div>
    </div>
  );
}
