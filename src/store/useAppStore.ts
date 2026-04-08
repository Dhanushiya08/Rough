// store/useAppStore.ts
import { create } from "zustand";

type StepStatus = "pending" | "processing" | "completed" | "failed";

interface ProcessingProgress {
  extract: StepStatus;
  lookup: StepStatus;
  sap: StepStatus;
  park: StepStatus;
}

interface AppStore {
  fileId: string;
  setFileId: (id: string) => void;
  fileName: string;
  setFileName: (name: string) => void;

  progress: ProcessingProgress | null;
  setProgress: (p: ProcessingProgress) => void;

  pollingActive: boolean;
  setPollingActive: (v: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  fileId: "",
  setFileId: (id) => set({ fileId: id }),
  fileName: "",
  setFileName: (name) => set({ fileName: name }),

  progress: null,
  setProgress: (p) => set({ progress: p }),

  pollingActive: false,
  setPollingActive: (v) => set({ pollingActive: v }),
}));
