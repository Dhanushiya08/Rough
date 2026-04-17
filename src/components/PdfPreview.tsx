import { useState, useMemo, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useMutation } from "@tanstack/react-query";
import { fetchFileUrl } from "../services/extractionService";
import toast from "react-hot-toast";
import { useAppStore } from "../store/useAppStore";
import "../App.css";
import ZoomableTIFFViewer from "./ZoomableTIFFViewer";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
// import ProcessingOverlay from "./ProcessingOverlay";

//  Worker (only once here)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();
type TiffControls = {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  scale: number;
};
export default function PdfPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState(1);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const file_id = useAppStore((s) => s.fileId);
  const fileName = useAppStore((s) => s.fileName);
  // const [filename, setFilename] = useState<string>("");
  const [tiffControls, setTiffControls] = useState<TiffControls | null>(null);
  const pages = useMemo(
    () => Array.from({ length: numPages }, (_, i) => i + 1),
    [numPages],
  );
  const [isRendering, setIsRendering] = useState(true);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsRendering(false);
  };

  const canZoomOut = scale > 0.5;
  const canZoomIn = scale < 3;
  const tiffScale = tiffControls?.scale ?? 1;
  const fileMutation = useMutation({
    mutationFn: fetchFileUrl,
    onMutate: () => {
      setIsRendering(true);
    },
    onSuccess: (res) => {
      setFileType(res.body.file_type);
      const url = res.body.presignedUrl;
      // const file_name = res.body.file_name;
      // setFilename(file_name);
      console.log(url);
      setFileUrl(url);
      if (res.body.file_type !== "pdf") {
        console.log(res.body.file_type);
        setIsRendering(false);
      }
    },

    onError: () => {
      toast.error("Failed to fetch file");
      setIsRendering(false);
    },
  });
  useEffect(() => {
    if (!file_id) return;

    fileMutation.mutate({
      file_id,
      event: "get_file_url",
      file_name: fileName,
    });
  }, [file_id]);
  console.log(isRendering);
  return (
    <div
      className="w-full h-full border rounded-xl bg-gray-100 flex flex-col overflow-hidden"
      style={{ minHeight: 0 }}
    >
      {/* {(fileMutation.isPending || isRendering) && (
        <ProcessingOverlay
          title="Preparing your document..."
          description="We are retrieving and rendering your document. This may take a few moments."
        />
      )} */}
      {/* HEADER */}
      <div className="flex justify-between items-center p-3 border-b bg-white shadow-sm">
        <p className="text-sm text-gray-500 font-medium">
          {/* {fileType === "pdf" && <p>Pages: {numPages || "--"}</p>} */}
          {fileName ? fileName : ""}
        </p>

        {/* Premium Controls */}

        <div className="flex items-center gap-2 bg-gray-100/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-inner border">
          <button
            disabled={fileType === "pdf" ? !canZoomOut : tiffScale <= 0.1}
            onClick={() => {
              if (fileType === "pdf") {
                setScale((prev) => Math.max(prev - 0.2, 0.5));
              } else {
                tiffControls?.zoomOut();
              }
            }}
            className="p-2 rounded-full hover:bg-white shadow-sm transition active:scale-90 disabled:opacity-40"
          >
            <ZoomOut size={16} />
          </button>
          {/* SCALE */}
          <span className="text-xs font-semibold text-gray-700 w-12 text-center">
            {fileType === "pdf"
              ? Math.round(scale * 100)
              : Math.round((tiffControls?.scale || 1) * 100)}
            %
          </span>
          {/* ZOOM IN */}
          <button
            disabled={fileType === "pdf" ? !canZoomIn : tiffScale >= 10}
            onClick={() => {
              if (fileType === "pdf") {
                setScale((prev) => Math.min(prev + 0.2, 3));
              } else {
                tiffControls?.zoomIn();
              }
            }}
            className="p-2 rounded-full hover:bg-white shadow-sm transition active:scale-90 disabled:opacity-40"
          >
            <ZoomIn size={16} />
          </button>
          {/* RESET */}
          <button
            onClick={() => {
              if (fileType === "pdf") {
                setScale(1);
              } else {
                tiffControls?.reset();
              }
            }}
            className="p-2 rounded-full hover:bg-white shadow-sm transition active:scale-90"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-3 min-h-0"
        style={{ height: 0 }}
      >
        {/* PDF */}
        {fileType === "pdf" && fileUrl && (
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(err) => console.error("PDF load error:", err)}
          >
            {pages.map((page) => (
              <Page
                key={page}
                pageNumber={page}
                scale={scale}
                className="mb-4 max-w-full"
              />
            ))}
          </Document>
        )}

        {/* TIFF */}
        {fileType === "tiff" && fileUrl && (
          <ZoomableTIFFViewer tiff={fileUrl} onZoomChange={setTiffControls} />
        )}
        {/* fallback */}
        {fileType === "unknown" && (
          <p className="text-red-500">Unsupported file type</p>
        )}
      </div>
    </div>
  );
}
