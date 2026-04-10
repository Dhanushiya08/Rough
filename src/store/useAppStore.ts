// store/useAppStore.ts
import { create } from "zustand";

type StepStatus = "pending" | "processing" | "waiting" | "completed" | "failed";

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
  lang: string;
  setLang: (name: string) => void;

  progress: ProcessingProgress | null;
  setProgress: (p: ProcessingProgress) => void;

  pollingActive: boolean;
  setPollingActive: (v: boolean) => void;

  userManualStep: boolean;
  setUserManualStep: (val: boolean) => void;

  currentStep: string;
  setCurrentStep: (step: string) => void;

  showStepper: boolean;
  openStepper: (id: string, name: string, currentStep: string) => void;
  closeStepper: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  fileId: "",
  setFileId: (id) => set({ fileId: id }),

  fileName: "",
  setFileName: (name) => set({ fileName: name }),

  lang: "",
  setLang: (name) => set({ lang: name }),

  progress: null,
  setProgress: (p) => set({ progress: p }),

  pollingActive: false,
  setPollingActive: (v) => set({ pollingActive: v }),

  userManualStep: false,
  // setUserManualStep: (v) => set({ pollingActive: v }),
  setUserManualStep: (v) => set({ userManualStep: v }),

  currentStep: "",
  setCurrentStep: (step) => set({ currentStep: step }),

  showStepper: false,

  openStepper: (id, name, currentStep) =>
    set({
      fileId: id,
      fileName: name,
      currentStep,
      showStepper: true,
    }),

  closeStepper: () =>
    set({
      fileId: "",
      fileName: "",
      currentStep: "",
      showStepper: false,
    }),
}));
