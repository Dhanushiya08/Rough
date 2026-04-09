// components/StepProgressBar.tsx
import { useEffect } from "react";
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
const stepMap: Record<string, number> = {
  upload: 1,
  extract: 2,
  lookup: 3,
  sap: 4,
  park: 5,
};

function StepProgressBarInner() {
  const { current, goTo } = useStep();
  const progress = useAppStore((s) => s.progress);
  const currentStep = useAppStore((s) => s.currentStep);
  const setCurrentStep = useAppStore((s) => s.setCurrentStep);
  console.log(currentStep);
  console.log(progress);

  // const isStepDisabled = (stepId: number): boolean => {
  //   const key = stepProgressKey[stepId];
  //   if (!key) return false; // Upload always enabled
  //   if (!progress) return stepId !== 1; // Before polling starts, lock all except upload

  //   const status = progress[key];
  //   // Disable if currently "processing" — user must wait
  //   return status === "processing";
  // };
  const isStepDisabled = (stepId: number): boolean => {
    const key = stepProgressKey[stepId];

    // Step 1 (Upload) always allowed
    if (!key) return false;

    // Before progress → only upload allowed
    if (!progress) return stepId !== 1;

    const status = progress[key];

    //  Block pending (cannot open page)
    if (status === "pending") return true;

    //  Allow everything else (processing, waiting, completed, failed)
    return false;
  };

  const steps: Step[] = [
    {
      id: 1,
      label: "Upload",
      component: <Uploading />,
    },
    {
      id: 2,
      label: "Extraction",
      component: <Extraction />,
    },
    { id: 3, label: "Lookup", component: <Lookup /> },
    {
      id: 4,
      label: "Reconciliation",
      component: <Reconciliation />,
    },
    { id: 5, label: "Parking", component: <Parking /> },
  ];

  useEffect(() => {
    if (!currentStep) return;

    const stepNumber = stepMap[currentStep];
    console.log(stepNumber);

    if (stepNumber && stepNumber !== current) {
      goTo(stepNumber);

      setCurrentStep("");
    }
  }, [currentStep]);
  return (
    <div className="h-full flex flex-col">
      <div className="h-[10%] flex items-center px-10 border-b border-gray-200 bg-stepbgheader py-4">
        <div className="flex justify-center w-full">
          <div className="flex items-center justify-between relative w-full max-w-4xl">
            {/* Background line */}
            <div className="absolute top-4 left-0 right-0 h-px bg-gray-200" />

            {/* Progress fill line */}
            <div
              className="absolute top-4 left-0 h-px bg-primary transition-all duration-500"
              style={{
                width: `${((current - 1) / (steps.length - 1)) * 100}%`,
              }}
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
                    disabled
                      ? "This step is currently processing..."
                      : undefined
                  }
                  className={`relative z-10 flex flex-col items-center gap-2 ${
                    disabled ? "opacity-4 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <div
                    className={[
                      "w-7 h-7 rounded-lg flex items-center justify-center text-sm font-medium border",
                      isCompleted
                        ? "bg-primary border-primary text-white"
                        : isActive
                          ? "bg-primary border-primary text-white"
                          : "bg-[#D9E4EA] border-gray-300 text-gray-400",
                    ].join(" ")}
                  >
                    {isCompleted ? "✓" : step.id}
                  </div>

                  <span
                    className={[
                      "text-xs font-semibold uppercase tracking-wide",
                      isActive
                        ? "text-primary"
                        : isCompleted
                          ? "text-gray-600"
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
