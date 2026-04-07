import { useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast, { Toaster } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
// import { uploadDocument } from "../services/postService";
import { CloudUpload, Zap } from "lucide-react";
import CustomSelect from "./CustomSelect";
import { generateUniqueID } from "../utils/useUniqueId";
import { useAppStore } from "../store/useAppStore";
// import { startDocumentProcessing } from "../services/processingService";
import axios from "axios";
// import axios, { AxiosError } from "axios";
import apiClient from "../services/apiClient";

const MAX_SIZE = 3 * 1024 * 1024;
type StepStatus = "pending" | "processing" | "completed";

interface Progress {
  extract: StepStatus;
  lookup: StepStatus;
  sap: StepStatus;
  park: StepStatus;
}
const schema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => ["application/pdf", "image/tiff"].includes(file.type), {
      message: "Only PDF or TIFF allowed",
    })
    .refine((file) => file.size <= MAX_SIZE, {
      message: "Max file size is 3MB",
    }),
});

type FormData = z.infer<typeof schema>;

export default function Uploading({ goNext }: { goNext?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [lang, setLang] = useState<string | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);

  const fileId = useAppStore((s) => s.fileId);
  const setFileId = useAppStore((s) => s.setFileId);
  const fileName = useAppStore((s) => s.fileName);
  const setFileName = useAppStore((s) => s.setFileName);

  const {
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // const uploadMutation = useMutation({
  //   mutationFn: ({ file, id }: { file: File; id: string }) =>
  //     uploadDocument(file, id, setProgress),

  //   onSuccess: (data) => {
  //     toast.success("Upload successful");
  //     setFileId(data.file_id);
  //     setIsUploaded(true);
  //     setConfirm(false);
  //   },

  //   onError: () => {
  //     toast.error("Upload failed");
  //     setIsUploaded(false);
  //   },
  // });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, id }: { file: File; id: string }) => {
      if (file.size > 15 * 1024 * 1024) {
        throw new Error("File exceeds 15MB limit");
      }

      const { data } = await apiClient.post("/posts", {
        file_id: id,
        file_name: file.name,
        event: "upload-file",
      });
      const uploadUrl = data?.body?.presignedUrl;

      if (!uploadUrl) {
        throw new Error("Presigned URL not received");
      }

      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          );
          setProgress(percent);
        },
      });

      return {
        file_id: data.file_id || id,
      };
    },

    onSuccess: (data) => {
      toast.success("Upload successful");
      setFileId(data.file_id);
      // setFileName(data.file_name);
      setIsUploaded(true);
      setConfirm(false);
    },
    onError: (error: unknown) => {
      let message = "Upload failed";

      if (axios.isAxiosError(error)) {
        // Axios error (API / network)
        message = error.response?.data?.message || error.message || message;
      } else if (error instanceof Error) {
        // Normal JS error
        message = error.message;
      }

      toast.error(message);
      setIsUploaded(false);
    },
  });

  const onDrop = (acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (!selected) return;

    setValue("file", selected);
    setFile(selected);
    setFileName(selected.name);

    setConfirm(true);
    setIsUploaded(false);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "image/tiff": [".tiff"],
    },
  });

  const languageOptions = [
    { label: "English", value: "english" },
    { label: "Bahasa", value: "bahasa" },
    { label: "Mandarin", value: "mandarin" },
  ];

  // const processingMutation = useMutation({
  //   mutationFn: ({ file_id, lang }: { file_id: string; lang: string }) =>
  //     startDocumentProcessing({
  //       event: "start-trigger",
  //       lang,
  //       file_id,
  //       file_name: fileName,
  //     }),

  //   onSuccess: () => {
  //     toast.success("Processing started");

  //     goNext?.();
  //   },

  //   onError: () => {
  //     toast.error("Processing failed");
  //   },
  // });
  const processingMutation = useMutation({
    mutationFn: async ({
      file_id,
      lang,
    }: {
      file_id: string;
      lang: string;
    }) => {
      return await apiClient.post("/posts", {
        event: "start-trigger",
        file_id,
        lang,
        file_name: fileName,
      });
    },

    retry: 2,
    retryDelay: 1000,

    onSuccess: () => {
      toast.success("Processing started");

      if (fileId) {
        pollDocumentStatus(fileId);
      }

      goNext?.();
    },

    onError: (error: unknown) => {
      let message = "Processing interrupted";

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 500) {
          message = "Server error while starting process";
        } else {
          message = error.response?.data?.message || error.message || message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }

      toast.error(message);
    },
  });

  const isProcessing = processingMutation.isPending || uploadMutation.isPending;

  const handleProcess = () => {
    if (!fileId || !isUploaded) {
      toast.error("Upload file first");
      return;
    }

    if (!lang) {
      toast.error("Select language");
      return;
    }

    processingMutation.mutate({
      file_id: fileId,
      lang,
    });
  };

  const resetAll = () => {
    setFile(null);
    setFileId("");
    setLang(null);
    setConfirm(false);
    setProgress(0);
    setIsUploaded(false);
  };
  // const pollDocumentStatus = (file_id: string) => {
  //   const startTime = Date.now();
  //   const TIMEOUT = 20000; // 20 sec

  //   const interval = setInterval(async () => {
  //     try {
  //       const { data } = await apiClient.post("/posts", {
  //         event: "get-doc",
  //         file_id,
  //       });

  //       const body =
  //         typeof data.body === "string" ? JSON.parse(data.body) : data.body;

  //       console.log("Polling:", body);

  //       const progress = body?.progress;

  //       //  check completion
  //       if (
  //         progress?.extract === "completed" &&
  //         progress?.lookup === "completed" &&
  //         progress?.sap === "completed" &&
  //         progress?.park === "completed"
  //       ) {
  //         clearInterval(interval);
  //         toast.success("Processing completed ");
  //         return;
  //       }

  //       //  stop after 20 sec
  //       if (Date.now() - startTime > TIMEOUT) {
  //         clearInterval(interval);
  //         toast.error("Timeout: Not completed");
  //       }
  //     } catch (err: unknown) {
  //       clearInterval(interval);

  //       let message = "Polling failed";

  //       if (axios.isAxiosError(err)) {
  //         message = err.response?.data?.message || err.message || message;
  //       } else if (err instanceof Error) {
  //         message = err.message;
  //       }

  //       toast.error(message);
  //     }
  //   }, 3000); // every 3 sec
  // };
  const prevProgressRef = useRef<Progress | null>(null);

  const pollDocumentStatus = (file_id: string) => {
    const interval = setInterval(async () => {
      try {
        const { data } = await apiClient.post("/posts", {
          event: "get-doc",
          file_id,
        });

        const body =
          typeof data.body === "string" ? JSON.parse(data.body) : data.body;

        // const progress = body?.progress;
        const progress: Progress | undefined = body?.progress;
        console.log("Polling:", progress);
        if (!progress) return;

        const prev = prevProgressRef.current;

        //  Step-by-step detection
        if (prev) {
          if (
            prev.extract !== "completed" &&
            progress?.extract === "completed"
          ) {
            goNext?.();
          }

          if (prev.lookup !== "completed" && progress?.lookup === "completed") {
            goNext?.();
          }

          if (prev.sap !== "completed" && progress?.sap === "completed") {
            goNext?.();
          }

          if (prev.park !== "completed" && progress?.park === "completed") {
            goNext?.();
          }
        }

        // save current state
        prevProgressRef.current = progress;

        //  final completion
        if (
          progress?.extract === "completed" &&
          progress?.lookup === "completed" &&
          progress?.sap === "completed" &&
          progress?.park === "completed"
        ) {
          clearInterval(interval);
          toast.success("Processing completed");
        }
      } catch (err: unknown) {
        clearInterval(interval);

        let message = "Polling failed";

        if (axios.isAxiosError(err)) {
          message = err.response?.data?.message || err.message || message;
        } else if (err instanceof Error) {
          message = err.message;
        }

        toast.error(message);
      }
    }, 20000);
  };

  return (
    <div className="h-full flex items-center justify-center bg-[#F7F9FB]">
      <Toaster />

      <div className="w-[420px] bg-white rounded-md p-5 space-y-4 shadow-md relative">
        {isProcessing && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center text-sm font-medium text-primary z-10">
            Processing...
          </div>
        )}

        {/* HEADER */}
        <div className="p-3">
          <h2 className="text-primary font-semibold text-sm">
            Upload Source Documents
          </h2>
          <p className="text-xs text-gray-500">
            Supported formats: PDF, TIFF (Max 3MB)
          </p>
        </div>

        {/* DROPZONE */}
        {!file && (
          <div
            {...(!isProcessing ? getRootProps() : {})}
            className={`border border-dashed rounded-md p-10 text-center transition 
            ${
              isProcessing
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:bg-stepbgheader/10"
            }`}
          >
            <input {...getInputProps()} disabled={isProcessing} />

            <div className="flex flex-col items-center gap-2">
              <div className="bg-accent/20 p-3 rounded-lg text-primary text-xl">
                <CloudUpload />
              </div>
              <p className="text-secondary text-sm">
                Drop files here or click to browse
              </p>
            </div>
          </div>
        )}

        {/* LANGUAGE */}
        <CustomSelect
          label="OCR LANGUAGE"
          placeholder="Select a Language"
          options={languageOptions}
          onChange={(val) => setLang(val)}
          disabled={!isUploaded || isProcessing}
        />

        {/* FILE CONFIRM */}
        {confirm && file && (
          <div className="border border-borderer rounded p-3 bg-accent/10 text-sm">
            <p className="mb-2 text-secondary">
              Uploaded: <strong className="text-primary">{file.name}</strong>
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (!file) return;

                  setProgress(0);
                  setIsUploaded(false);

                  const id = generateUniqueID();

                  uploadMutation.mutate({
                    file,
                    id,
                  });
                }}
                disabled={isProcessing || !file}
                className="bg-primary text-white px-4 py-2 rounded w-full"
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload"}
              </button>

              <button
                onClick={resetAll}
                disabled={isProcessing}
                className="border border-borderer px-3 py-2 rounded text-secondary disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* ✅ START BUTTON ONLY AFTER UPLOAD */}
        {isUploaded && fileId && (
          <button
            onClick={handleProcess}
            disabled={!lang || processingMutation.isPending}
            className="w-full py-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 bg-primary text-white"
          >
            {processingMutation.isPending
              ? "Processing..."
              : "Start Document Processing"}
            <Zap size={16} />
          </button>
        )}

        {/* ERROR */}
        {errors.file && (
          <p className="text-red-500 text-xs">{errors.file.message}</p>
        )}

        {/* PROGRESS */}
        {progress > 0 && (
          <div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs mt-1 text-secondary text-right">
              {progress}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
