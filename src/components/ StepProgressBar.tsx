// components/StepProgressBar.tsx
import { StepProvider } from "../context/StepProvider";
import { useStep } from "../hooks/useStep";
import { useAppStore } from "../store/useAppStore";
import Uploading from "./Uploading";
import Extraction from "./Extraction";
import Lookup from "./Lookup";
import Reconciliation from "./Reconciliation";
import Parking from "./Parking";
import type { Step } from "../types/common";

const stepProgressKey: Record<
  number,
  keyof NonNullable<ReturnType<typeof useAppStore.getState>["progress"]> | null
> = {
  1: null,
  2: "extract",
  3: "lookup",
  4: "sap",
  5: "park",
};

function StepProgressBarInner() {
  const { current, goTo } = useStep();
  const progress = useAppStore((s) => s.progress);

  const isStepDisabled = (stepId: number): boolean => {
    const key = stepProgressKey[stepId];
    if (!key) return false; // Upload always enabled
    if (!progress) return stepId !== 1; // Before polling starts, lock all except upload

    const status = progress[key];
    // Disable if currently "processing" — user must wait
    return status === "processing";
  };

  const steps: Step[] = [
    {
      id: 1,
      label: "Upload",
      description: "...",
      component: <Uploading />,
    },
    {
      id: 2,
      label: "Extraction",
      description: "...",
      component: <Extraction />,
    },
    { id: 3, label: "Lookup", description: "...", component: <Lookup /> },
    {
      id: 4,
      label: "Reconciliation",
      description: "...",
      component: <Reconciliation />,
    },
    { id: 5, label: "Parking", description: "...", component: <Parking /> },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="h-[10%] flex items-center px-10 border-b border-gray-200 bg-stepbgheader py-4">
        <div className="flex items-center justify-between relative w-full">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-300" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
            style={{ width: `${((current - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step) => {
            const isCompleted = step.id < current;
            const isActive = step.id === current;
            const disabled = isStepDisabled(step.id);

            return (
              <button
                key={step.id}
                onClick={() => !disabled && goTo(step.id)}
                disabled={disabled}
                title={
                  disabled ? "This step is currently processing..." : undefined
                }
                className={`relative z-10 flex flex-col items-center gap-2 ${
                  disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                }`}
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
    <StepProvider totalSteps={5}>
      <StepProgressBarInner />
    </StepProvider>
  );
}
