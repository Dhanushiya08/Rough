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

  immediateLoad: boolean;

  initialLoading: boolean;
  setInitialLoading: (v: boolean) => void;

  showStepper: boolean;
  openStepper: (
    id: string,
    name: string,
    lang: string,
    currentStep: string,
    immediate?: boolean,
  ) => void;
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
  setUserManualStep: (v) => set({ userManualStep: v }),

  currentStep: "",
  setCurrentStep: (step) => set({ currentStep: step }),

  immediateLoad: false,

  initialLoading: false,
  setInitialLoading: (v) => set({ initialLoading: v }),

  showStepper: false,

  openStepper: (id, name, lang, currentStep, immediate = false) =>
    set({
      fileId: id,
      fileName: name,
      lang: lang,
      currentStep,
      showStepper: true,
      immediateLoad: immediate,
      initialLoading: !!id,
      progress: null,
      pollingActive: false,
    }),

  closeStepper: () =>
    set({
      fileId: "",
      fileName: "",
      lang: "",
      currentStep: "",
      showStepper: false,
      immediateLoad: false,
      initialLoading: false,
      pollingActive: false,
      userManualStep: false,
      progress: null,
    }),
}));
