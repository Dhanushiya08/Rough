import { useRef } from "react";
import { useAppStore } from "../store/useAppStore";
import apiClient from "../services/apiClient";
import toast from "react-hot-toast";

type StepStatus = "pending" | "processing" | "waiting" | "completed" | "failed";

interface Progress {
  extract: StepStatus;
  lookup: StepStatus;
  sap: StepStatus;
  park: StepStatus;
}

const getTargetStep = (progress: Progress): number => {
  if (progress.park === "processing" || progress.park === "completed") return 5;
  if (progress.sap === "processing" || progress.sap === "completed") return 4;
  if (progress.lookup === "processing" || progress.lookup === "completed")
    return 3;
  if (progress.extract === "processing" || progress.extract === "completed")
    return 2;
  return 1;
};

const isAnyProcessing = (progress: Progress): boolean => {
  return Object.values(progress).some((status) => status === "processing");
};

const isAllCompleted = (progress: Progress): boolean => {
  return Object.values(progress).every((status) => status === "completed");
};

const isAnyFailed = (progress: Progress): boolean => {
  return Object.values(progress).some((status) => status === "failed");
};

export function usePollDocumentStatus() {
  const setProgress = useAppStore((s) => s.setProgress);
  const setPollingActive = useAppStore((s) => s.setPollingActive);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAutoStepRef = useRef<number>(0);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setPollingActive(false);
    }
  };

  const startPolling = (
    file_id: string,
    goTo: (step: number) => void,
    getCurrent: () => number,
  ) => {
    stopPolling();

    setPollingActive(true);
    lastAutoStepRef.current = 0;

    intervalRef.current = setInterval(async () => {
      try {
        const { data } = await apiClient.post("/posts", {
          event: "get-doc",
          file_id,
        });

        const body =
          typeof data.body === "string" ? JSON.parse(data.body) : data.body;

        const progress: Progress | undefined = body?.progress;
        if (!progress) return;

        setProgress(progress);
        console.log(progress, "startpoll");

        if (isAnyFailed(progress)) {
          stopPolling();
          toast.error("Processing failed at one of the steps");
          return;
        }

        if (!isAnyProcessing(progress)) {
          stopPolling();

          if (isAllCompleted(progress)) {
            toast.success("Processing completed");
          }
          return;
        }

        const targetStep = getTargetStep(progress);
        const current = getCurrent();
        const userManualStep = useAppStore.getState().userManualStep;

        if (targetStep !== lastAutoStepRef.current) {
          lastAutoStepRef.current = targetStep;
          useAppStore.getState().setUserManualStep(false);
          if (current !== targetStep) {
            goTo(targetStep);
          }
        } else if (!userManualStep) {
          if (current !== targetStep) {
            goTo(targetStep);
          }
        }
      } catch {
        stopPolling();
        toast.error("Polling failed");
      }
    }, 5000);
  };

  return { startPolling, stopPolling };
}
