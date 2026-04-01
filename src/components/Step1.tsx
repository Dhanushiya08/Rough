import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast, { Toaster } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { uploadDocument } from "../services/postService";
import "../App.css";
import { CloudUpload, Zap } from "lucide-react";
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

export default function Step1({ goNext }: { goNext?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [confirm, setConfirm] = useState(false);

  const {
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: ({ file }: { file: File }) => uploadDocument(file, setProgress),

    onSuccess: (data) => {
      console.log(data);
      toast.success("Upload successful");

      // Optional: store documentId
      // const docId = data?.documentId;

      // Reset state
      setFile(null);
      setConfirm(false);
      setProgress(0);

      // 👉 Move to next step
      goNext?.();
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

  return (
    <div className="h-full flex items-center justify-center bg-[#F7F9FB]">
      <Toaster />

      <div className="w-[420px] bg-white rounded-md p-5 space-y-4 shadow-md">
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
            {...getRootProps()}
            className="border border-dashed border-borderer rounded-md p-10 text-center cursor-pointer hover:bg-stepbgheader/10 transition bg-stepbgheader"
          >
            <input {...getInputProps()} />

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
        <div className="border border-dashed border-borderer p-2">
          <p className="text-[10px] text-primary mb-1 font-semibold">
            OCR LANGUAGE
          </p>

          <select className="w-full border border-borderer rounded px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option>Select a Language</option>
            <option>English</option>
            <option>Indo Bahasa </option>
            <option>Mandarin</option>
          </select>
        </div>

        {/* CONFIRMATION */}
        {confirm && file && (
          <div className="border border-borderer rounded p-3 bg-accent/10 text-sm">
            <p className="mb-2 text-secondary">
              Uploaded: <strong className="text-primary">{file.name}</strong>
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => file && mutation.mutate({ file })}
                disabled={mutation.isPending}
                className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded w-full transition"
              >
                {mutation.isPending
                  ? "Uploading..."
                  : "Start Document Processing ⚡"}
              </button>

              <button
                onClick={() => {
                  setFile(null);
                  setConfirm(false);
                  setProgress(0);
                }}
                className="border border-borderer px-3 py-2 rounded text-secondary hover:bg-gray-100"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* BUTTON */}
        {!confirm && (
          <button
            disabled={!file}
            className={`w-full py-3 rounded-md text-sm font-medium flex items-center justify-center gap-2
      ${
        file
          ? "bg-primary text-white hover:bg-primary/90 cursor-pointer"
          : "bg-primary/40 text-white cursor-not-allowed opacity-50"
      }`}
          >
            Start Document Processing <Zap size={16} />
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
