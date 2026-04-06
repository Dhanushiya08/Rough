import { StepProvider } from "../context/StepProvider";
import { useStep } from "../hooks/useStep";
import Uploading from "./Uploading";
import Extraction from "./Extraction";
import Lookup from "./Lookup";
import Reconciliation from "./Reconciliation";
import Parking from "./Parking";
import type { Step } from "../types/common";

const steps: Step[] = [
  {
    id: 1,
    label: "Upload",
    description: "Upload a PDF or TIFF document for processing",
    component: <Uploading />,
  },
  {
    id: 2,
    label: "Extraction",
    description: "Analyze the document and extract raw data using OCR",
    component: <Extraction />,
  },
  {
    id: 3,
    label: "Lookup",
    description: "Review and edit the extracted key fields for accuracy",
    component: <Lookup />,
  },
  {
    id: 4,
    label: "Reconciliation",
    description: "Fetch additional details using the document identifier",
    component: <Reconciliation />,
  },
  {
    id: 5,
    label: "Parking",
    description: "Ensure all fields are complete and validated",
    component: <Parking />,
  },
];

function StepProgressBarInner() {
  const { current, goTo } = useStep();

  return (
    <div className="h-full flex flex-col">
      <div className="h-[10%] flex items-center px-10 border-b border-gray-200 bg-stepbgheader py-4">
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
                onClick={() => goTo(step.id)}
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

      <div className="h-[90%] flex flex-col justify-between px-10 py-6">
        <div className="flex-1 overflow-auto w-full">
          {steps[current - 1].component}
        </div>
      </div>
    </div>
  );
}

export default function StepProgressBar() {
  return (
    <StepProvider totalSteps={steps.length}>
      <StepProgressBarInner />
    </StepProvider>
  );
}
