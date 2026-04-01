import { useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";

interface Step {
  id: number;
  label: string;
  description: string;
  component: React.ReactNode;
}
const steps: Step[] = [
  {
    id: 1,
    label: "Upload",
    description: "Upload a PDF or TIFF document for processing",
    component: <Step1 />,
  },
  {
    id: 2,
    label: "Extraction",
    description: "Analyze the document and extract raw data using OCR",
    component: <Step2 />,
  },
  {
    id: 3,
    label: "Lookup",
    description: "Review and edit the extracted key fields for accuracy",
    component: <Step3 fileUrl="" />,
  },
  {
    id: 4,
    label: "Reconciliation",
    description: "Fetch additional details using the document identifier",
    component: <Step1 />,
  },
  {
    id: 5,
    label: "Parking",
    description: "Ensure all fields are complete and validated",
    component: <Step2 />,
  },
];

export default function StepProgressBar() {
  const [current, setCurrent] = useState<number>(1);

  const goNext = () => setCurrent((c) => Math.min(c + 1, steps.length));
  const goPrev = () => setCurrent((c) => Math.max(c - 1, 1));

  return (
    <div className="h-full flex flex-col">
      <div className="h-[8%] flex items-center px-10 border-b border-gray-200 bg-stepbgheader">
        <div className="flex items-center justify-between relative w-full">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-300" />

          <div
            className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
            style={{
              width: `${((current - 1) / (steps.length - 1)) * 100}%`,
            }}
          />

          {steps.map((step) => {
            const isCompleted = step.id < current;
            const isActive = step.id === current;

            return (
              <button
                key={step.id}
                onClick={() => setCurrent(step.id)}
                className="relative z-10 flex flex-col items-center gap-2"
              >
                <div
                  className={[
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2",
                    isCompleted
                      ? "bg-primary border-primary text-white"
                      : isActive
                        ? "bg-white border-primary text-primary scale-110"
                        : "bg-gray-100 border-gray-300 text-gray-400",
                  ].join(" ")}
                >
                  {isCompleted ? "✓" : step.id}
                </div>

                <span
                  className={[
                    "text-xs font-semibold",
                    isActive
                      ? "text-primary"
                      : isCompleted
                        ? "text-gray-700"
                        : "text-gray-400",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-[92%] flex flex-col justify-between px-10 py-6">
        <div className="flex-1 overflow-auto  w-full">
          {steps[current - 1].component}
        </div>

        {/* Buttons */}
        <div className="flex gap-4  w-[90%]  mx-auto  mt-2">
          <button
            onClick={goPrev}
            disabled={current === 1}
            className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-30"
          >
            ← Previous
          </button>

          <button
            onClick={goNext}
            disabled={current === steps.length}
            className="flex-1 py-3 rounded-lg bg-primary hover:bg-secondary text-white disabled:opacity-30"
          >
            {current === steps.length ? "Finish ✓" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
