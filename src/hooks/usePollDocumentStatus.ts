// hooks/usePollDocumentStatus.ts
import { useRef } from "react";
import { useAppStore } from "../store/useAppStore";
import apiClient from "../services/apiClient";
// import axios from "axios";
import toast from "react-hot-toast";

type StepStatus = "pending" | "processing" | "completed" | "failed";

interface Progress {
  extract: StepStatus;
  lookup: StepStatus;
  sap: StepStatus;
  park: StepStatus;
}

export function usePollDocumentStatus() {
  const setProgress = useAppStore((s) => s.setProgress);
  const setPollingActive = useAppStore((s) => s.setPollingActive);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPolling = (
    file_id: string,
    goTo: (step: number) => void,
    getCurrent: () => number, 
  ) => {
    if (intervalRef.current) return;
    setPollingActive(true);

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

        //  1. Handle failed state FIRST — stop polling immediately
        if (
          progress.extract === "failed" ||
          progress.lookup === "failed" ||
          progress.sap === "failed" ||
          progress.park === "failed"
        ) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setPollingActive(false);
          toast.error("Processing failed at one of the steps");
          return;
        }

        //  2. Navigate only if not already on correct step
        const current = getCurrent();

        if (
          (progress.park === "processing" || progress.park === "completed") &&
          current !== 5
        ) {
          goTo(5);
        } else if (
          (progress.sap === "processing" || progress.sap === "completed") &&
          current !== 4
        ) {
          goTo(4);
        } else if (
          (progress.lookup === "processing" ||
            progress.lookup === "completed") &&
          current !== 3
        ) {
          goTo(3);
        } else if (
          (progress.extract === "processing" ||
            progress.extract === "completed") &&
          current !== 2
        ) {
          goTo(2);
        }

        //  3. Stop polling when all completed
        if (
          progress.extract === "completed" &&
          progress.lookup === "completed" &&
          progress.sap === "completed" &&
          progress.park === "completed"
        ) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setPollingActive(false);
          toast.success("Processing completed");
        }
      } catch {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setPollingActive(false);
        toast.error("Polling failed");
      }
    }, 5000);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      setPollingActive(false);
    }
  };

  return { startPolling, stopPolling };
}
