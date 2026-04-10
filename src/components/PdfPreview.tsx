import { useState, useMemo, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
// import { TIFFViewer } from "react-tiff";
// import pdfFile from "../assets/Invoice_Extraction_Rules.docx.pdf";
// import tiffFile from "../assets/file_example_TIFF_1MB.tiff";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "react-tiff/dist/index.css";
import { useMutation } from "@tanstack/react-query";
import { fetchFileUrl } from "../services/extractionService";
import toast from "react-hot-toast";
import { useAppStore } from "../store/useAppStore";
import "../App.css";
import ZoomableTIFFViewer from "./ZoomableTIFFViewer";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

//  Worker (only once here)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function PdfPreview() {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState(1);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const file_id = useAppStore((s) => s.fileId);
  const fileName = useAppStore((s) => s.fileName);

  const pages = useMemo(
    () => Array.from({ length: numPages }, (_, i) => i + 1),
    [numPages],
  );

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // const detectFileType = (url: string) => {
  //   try {
  //     const cleanUrl = url.split("?")[0];
  //     const ext = cleanUrl.split(".").pop()?.toLowerCase();

  //     if (ext === "pdf") {
  //       setFileType("pdf");
  //     } else if (ext === "tiff" || ext === "tif") {
  //       setFileType("tiff");
  //     } else {
  //       setFileType("unknown");
  //     }
  //   } catch {
  //     setFileType("unknown");
  //   }
  // };

  const canZoomOut = scale > 0.5;
  const canZoomIn = scale < 3;
  const fileMutation = useMutation({
    mutationFn: fetchFileUrl,

    onSuccess: (res) => {
      console.log(res);
      setFileType(res.body.file_type);
      const url = res.body.presignedUrl;
      console.log(url);
      setFileUrl(url);
      // detectFileType(url);
    },

    onError: () => {
      toast.error("Failed to fetch file");
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
  console.log(fileUrl, fileType);

  return (
    <div className="w-1/2 border rounded-xl bg-gray-100 flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="flex justify-between items-center p-3 border-b bg-white shadow-sm">
        <p className="text-sm text-gray-500 font-medium">
          Pages: {numPages || "--"}
        </p>

        {/* Premium Controls */}
        <div className="flex items-center gap-2 bg-gray-100/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-inner border">
          <button
            disabled={!canZoomOut}
            onClick={() => setScale((prev) => Math.max(prev - 0.2, 0.5))}
            className="p-2 rounded-full hover:bg-white shadow-sm transition active:scale-90 disabled:opacity-40"
          >
            <ZoomOut size={16} />
          </button>

          <span className="text-xs font-semibold text-gray-700 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            disabled={!canZoomIn}
            onClick={() => setScale((prev) => Math.min(prev + 0.2, 3))}
            className="p-2 rounded-full hover:bg-white shadow-sm transition active:scale-90 disabled:opacity-40"
          >
            <ZoomIn size={16} />
          </button>

          <button
            onClick={() => setScale(1)}
            className="p-2 rounded-full hover:bg-white shadow-sm transition active:scale-90"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        {/* {fileMutation.isPending && <p>Loading file...</p>} */}

        {/* PDF */}
        {fileType === "pdf" && fileUrl && (
          <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
            {pages.map((page) => (
              <Page
                key={page}
                pageNumber={page}
                scale={scale}
                className="mb-4"
              />
            ))}
          </Document>
        )}
        {/* TIFF */}
        {
          fileType === "tiff" && fileUrl && (
            <ZoomableTIFFViewer tiff={fileUrl} />
          )
          // <TIFFViewer tiff={fileUrl} />
        }
        {/* fallback */}
        {fileType === "unknown" && (
          <p className="text-red-500">Unsupported file type</p>
        )}
      </div>
    </div>
  );
}
