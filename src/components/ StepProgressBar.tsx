// components/StepProgressBar.tsx
import { useEffect, useRef } from "react";
import { StepProvider } from "../context/StepProvider";
import { useStep } from "../hooks/useStep";
import { useAppStore } from "../store/useAppStore";
import Uploading from "./Uploading";
import Extraction from "./Extraction";
import Lookup from "./Lookup";
import Reconciliation from "./Reconciliation";
import Parking from "./Parking";
import type { Step } from "../types/common";
import PdfPreview from "./PdfPreview";
import { usePollDocumentStatus } from "../hooks/usePollDocumentStatus";

type StepProgressKeyMap = Record<
  number,
  keyof NonNullable<ReturnType<typeof useAppStore.getState>["progress"]> | null
>;

const stepProgressKey: StepProgressKeyMap = {
  1: null,
  2: "extract",
  3: "lookup",
  4: "sap",
  5: "park",
};
// const stepMap: Record<string, number> = {
//   upload: 1,
//   extract: 2,
//   lookup: 3,
//   sap: 4,
//   park: 5,
// };

function StepProgressBarInner() {
  const { current, goTo } = useStep();
  const progress = useAppStore((s) => s.progress);
  // const currentStep = useAppStore((s) => s.currentStep);
  const fileId = useAppStore((s) => s.fileId);
  const { startPolling } = usePollDocumentStatus();
  // const setCurrentStep = useAppStore((s) => s.setCurrentStep);
  const setUserManualStep = useAppStore((s) => s.setUserManualStep);
  const currentRef = useRef(current);
  useEffect(() => {
    currentRef.current = current;
  }, [current]);
  // const isStepDisabled = (stepId: number): boolean => {
  //   const key = stepProgressKey[stepId];
  //   if (!key) return false;
  //   if (!progress) return stepId !== 1;
  //   const status = progress[key];
  //   if (status === "pending") return true;
  //   return false;
  // };
  // const maxAllowedStep = stepMap[currentStep] ?? 5;
  const maxAllowedStep = (() => {
    if (!progress) return 1;
    if (
      progress.park === "completed" ||
      progress.park === "processing" ||
      progress.park === "waiting"
    )
      return 5;
    if (
      progress.sap === "completed" ||
      progress.sap === "processing" ||
      progress.sap === "waiting"
    )
      return 4;
    if (progress.lookup === "completed" || progress.lookup === "processing")
      return 3;
    if (progress.extract === "completed" || progress.extract === "processing")
      return 2;
    return 1;
  })();

  const isStepDisabled = (stepId: number): boolean => {
    if (!fileId) {
      return stepId !== 1;
    }
    if (stepId === 1 && maxAllowedStep > 1) return true;
    if (stepId > maxAllowedStep) return true;
    const key = stepProgressKey[stepId];
    if (!key) return false;
    if (!progress) return stepId !== 1;
    return progress[key] === "pending";
  };

  const steps: Step[] = [
    { id: 1, label: "Upload", component: <Uploading /> },
    { id: 2, label: "Extraction", component: <Extraction /> },
    { id: 3, label: "Lookup", component: <Lookup /> },
    { id: 4, label: "Reconciliation", component: <Reconciliation /> },
    { id: 5, label: "Parking", component: <Parking /> },
  ];

  const totalSteps = steps.length;

  const canGoPrev = current > 1 && !isStepDisabled(current - 1);
  const canGoNext = current < totalSteps && !isStepDisabled(current + 1);

  const handlePrev = () => {
    if (canGoPrev) {
      setUserManualStep(true);
      goTo(current - 1);
    }
  };

  const handleNext = () => {
    if (!fileId) return;
    if (canGoNext) {
      goTo(current + 1);
    }
  };
  // useEffect(() => {
  //   if (!fileId || !currentStep) return;

  //   const stepNumber = stepMap[currentStep];

  //   if (!stepNumber) return;

  //   if (stepNumber !== current) {
  //     goTo(stepNumber);
  //   }

  //   startPolling(fileId, goTo, () => stepNumber);
  // }, [currentStep, fileId]);

  // useEffect(() => {
  //   if (!fileId) return;

  //   startPolling(fileId, goTo, () => current);
  // }, [fileId, current]);
  useEffect(() => {
    if (!fileId) return;
    startPolling(fileId, goTo, () => currentRef.current);
  }, [fileId]);
  return (
    <div className="h-full flex flex-col">
      <div className="h-[10%] flex items-center px-10 border-b border-gray-200 bg-stepbgheader py-4">
        <div className="flex items-center justify-between w-full">
          <button
            onClick={handlePrev}
            disabled={!canGoPrev}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              canGoPrev
                ? "text-primary border border-primary hover:bg-primary hover:text-white"
                : "text-gray-300 border border-gray-200 cursor-not-allowed"
            }`}
          >
            <span className="text-base leading-none">&lt;</span>
            Prev
          </button>

          {/*  CENTER: Step Bar */}
          <div className="flex items-center justify-between relative w-full max-w-4xl mx-6">
            {/* Background line */}
            <div className="absolute top-4 left-0 right-0 h-px bg-gray-200" />

            {/* Progress line */}
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
                  onClick={() => {
                    if (!disabled) {
                      if (step.id < current) setUserManualStep(true);
                      goTo(step.id);
                    }
                  }}
                  disabled={disabled}
                  className={`relative z-10 flex flex-col items-center gap-2 ${
                    disabled ? "opacity-4 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <div
                    className={[
                      "w-7 h-7 rounded-lg flex items-center justify-center text-sm font-medium border",
                      isCompleted || isActive
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

          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              canGoNext
                ? "text-primary border border-primary hover:bg-primary hover:text-white"
                : "text-gray-300 border border-gray-200 cursor-not-allowed"
            }`}
          >
            Next
            <span className="text-base leading-none">&gt;</span>
          </button>
        </div>
      </div>
      <div className="h-[90%] flex flex-col justify-between px-10 py-6">
        <div className="flex-1 w-full">
          {current === 1 ? (
            <div className="h-full overflow-auto">
              {steps[current - 1].component}
            </div>
          ) : (
            <div className="flex h-full gap-4 overflow-hidden">
              <div className="w-1/2 min-w-0 h-full h-screen shrink-0">
                <PdfPreview />
              </div>
              <div className="w-1/2 min-w-0 h-full overflow-auto shrink-0">
                {steps[current - 1].component}
              </div>
            </div>
          )}
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
