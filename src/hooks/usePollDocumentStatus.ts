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
  if (progress.park === "processing" || progress.park === "waiting" || progress.park === "failed") return 5;
  if (progress.sap === "processing" || progress.sap === "waiting" || progress.sap === "failed") return 4;
  if (progress.lookup === "processing" || progress.lookup === "failed") return 3;
  if (progress.extract === "processing" || progress.extract === "failed") return 2;
  if (progress.park === "completed") return 5;
  if (progress.sap === "completed") return 4;
  if (progress.lookup === "completed") return 3;
  if (progress.extract === "completed") return 2;
  return 1;
};

const isAnyProcessing = (progress: Progress): boolean =>
  Object.values(progress).some((status) => status === "processing");

const isAllCompleted = (progress: Progress): boolean =>
  Object.values(progress).every((status) => status === "completed");

const isAnyFailed = (progress: Progress): boolean =>
  Object.values(progress).some((status) => status === "failed");

export function usePollDocumentStatus() {
  const setProgress = useAppStore((s) => s.setProgress);
  const setPollingActive = useAppStore((s) => s.setPollingActive);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    immediate = false,
  ) => {
    stopPolling();
    setPollingActive(true);

    const tick = async () => {
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

        if (isAnyFailed(progress)) {
          stopPolling();
          toast.error("Processing failed");
          const targetStep = getTargetStep(progress);
          const userManualStep = useAppStore.getState().userManualStep;
          if (!userManualStep) goTo(targetStep);
          return;
        }

        const targetStep = getTargetStep(progress);
        const current = getCurrent();
        const userManualStep = useAppStore.getState().userManualStep;

        if (!userManualStep && current !== targetStep) {
          goTo(targetStep);
        }

        if (!isAnyProcessing(progress)) {
          stopPolling();
          if (isAllCompleted(progress)) {
            toast.success("Processing completed");
            if (!userManualStep) {
              goTo(targetStep);
            }
          }
        }
      } catch {
        stopPolling();
        toast.error("Polling failed");
      }
    };

    if (immediate) tick();
    intervalRef.current = setInterval(tick, 5000);
  };

  return { startPolling, stopPolling };
}
