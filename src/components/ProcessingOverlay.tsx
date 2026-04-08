import { Loader2 } from "lucide-react";

export default function ProcessingOverlay({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="absolute inset-0 bg-white/75 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg px-6 py-5 flex flex-col items-center gap-3 min-w-[260px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />

        {/* Text */}
        <div className="text-center">
          <p className="text-primary font-semibold text-sm">
            {title || "Processing in Progress"}
          </p>
          <p className="text-gray-500 text-xs mt-1 leading-relaxed">
            {description ||
              "Your request is being processed. Please wait while we complete this step."}
          </p>
        </div>
      </div>
    </div>
  );
}
