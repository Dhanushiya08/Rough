import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast, { Toaster } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { uploadDocument } from "../services/postService";
import { CloudUpload, Zap } from "lucide-react";
import CustomSelect from "./CustomSelect";
import { generateUniqueID } from "../utils/useUniqueId";
import { useAppStore } from "../store/useAppStore";
import { startDocumentProcessing } from "../services/processingService";

const MAX_SIZE = 3 * 1024 * 1024;

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
  const fileId = useAppStore((s) => s.fileId);
  const setFileId = useAppStore((s) => s.setFileId);
  const [lang, setLang] = useState<string | null>(null);

  const {
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const uploadMutation = useMutation({
    mutationFn: ({ file, id }: { file: File; id: string }) =>
      uploadDocument(file, id, setProgress),

    onSuccess: (data) => {
      toast.success("Upload successful");
      setFileId(data.file_id);
      setConfirm(false);
    },

    onError: () => {
      toast.error("Upload failed");
    },
  });

  const onDrop = (acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (!selected) return;

    setValue("file", selected);
    setFile(selected);
    setConfirm(true);
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

  const processingMutation = useMutation({
    mutationFn: ({ file_id, lang }: { file_id: string; lang: string }) =>
      startDocumentProcessing({
        event: "start-trigger",
        lang,
        file_id,
        status: "uploaded",
      }),

    onSuccess: () => {
      toast.success("Processing started");
      goNext?.();
    },

    onError: () => {
      toast.error("Processing failed");
    },
  });
  const isProcessing = processingMutation.isPending || uploadMutation.isPending;
  const handleProcess = () => {
    if (!fileId) {
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
  ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-stepbgheader/10"}`}
          >
            <input {...getInputProps()} disabled={isProcessing} />
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
          disabled={isProcessing}
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

                  const id = generateUniqueID();
                  setFileId(id);
                  console.log(file);
                  uploadMutation.mutate({
                    file,
                    id,
                  });
                }}
                // disabled={uploadMutation.isPending || !!fileId || isProcessing}
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

        {/* PROCESS BUTTON */}
        {fileId && (
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
