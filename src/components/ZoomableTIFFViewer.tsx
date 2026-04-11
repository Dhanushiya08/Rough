import React, { useRef, useState, useCallback, useEffect } from "react";
import { TIFFViewer } from "react-tiff";
import "react-tiff/dist/index.css";

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

const MIN_SCALE = 0.1;
const MAX_SCALE = 10;
const ZOOM_STEP = 0.25;

export default function ZoomableTIFFViewer({ tiff, onZoomChange }: Props) {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const zoomIn = () => setScale((s) => Math.min(MAX_SCALE, s + ZOOM_STEP));
  const zoomOut = () => setScale((s) => Math.max(MIN_SCALE, s - ZOOM_STEP));
  const reset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
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
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const stopDrag = () => setIsDragging(false);

  return (
    <div
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg overflow-hidden"
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: "center",
          transition: isDragging ? "none" : "transform 0.1s ease",
        }}
      >
        <TIFFViewer tiff={tiff} />
      </div>
    </div>
  );
}
