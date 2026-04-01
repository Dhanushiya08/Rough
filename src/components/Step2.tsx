import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type Status = "idle" | "processing" | "success" | "error";

interface Step2Props {
  fileName?: string;
  fileSize?: number;
  onComplete?: () => void;
}

export default function Step2({
  fileName = "document.pdf",
  fileSize = 1024 * 200,
  onComplete,
}: Step2Props) {
  const [status, setStatus] = useState<Status>("idle");

  // Simulate processing (replace with API later)
  useEffect(() => {
    if (status === "idle") {
      const timer = setTimeout(() => {
        setStatus("processing");
      }, 1000);

      return () => clearTimeout(timer);
    }

    if (status === "processing") {
      const timer = setTimeout(() => {
        const success = Math.random() > 0.2; // 80% success

        if (success) {
          setStatus("success");
          onComplete?.(); // move to next step
        } else {
          setStatus("error");
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [status]);

  const formatSize = (size: number) => {
    return `${(size / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="w-full flex flex-col items-center justify-center text-center py-10">
      {/* File Info */}
      <div className="mb-6">
        <p className="text-lg font-semibold text-gray-800">{fileName}</p>
        <p className="text-sm text-gray-500">{formatSize(fileSize)}</p>
      </div>

      {/* Status */}
      {status === "idle" && (
        <div className="text-gray-600">
          <p className="mb-4">Ready to start processing</p>
          <button
            onClick={() => setStatus("processing")}
            className="bg-primary text-white px-6 py-2 rounded-lg"
          >
            Start Process
          </button>
        </div>
      )}

      {status === "processing" && (
        <div className="flex flex-col items-center gap-3 text-primary">
          <Loader2 className="animate-spin w-8 h-8" />
          <p className="font-medium">Processing document...</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center gap-3 text-green-600">
          <CheckCircle className="w-10 h-10" />
          <p className="font-semibold">Processing Completed</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-3 text-red-600">
          <XCircle className="w-10 h-10" />
          <p className="font-semibold">Processing Failed</p>

          <button
            onClick={() => setStatus("processing")}
            className="mt-3 px-4 py-2 border rounded"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
