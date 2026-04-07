// store/useProcessingStore.ts
// import { create } from "zustand";

// interface ProcessingState {
//   isProcessing: boolean;
//   setProcessing: (value: boolean) => void;
// }

// export const useProcessingStore = create<ProcessingState>((set) => ({
//   isProcessing: false,
//   setProcessing: (value) => set({ isProcessing: value }),
// }));

import { create } from "zustand";

interface ProgressState {
  extract?: string;
  lookup?: string;
  sap?: string;
  park?: string;
}

interface ProcessingState {
  isProcessing: boolean;
  progress: ProgressState | null;

  setProcessing: (value: boolean) => void;
  setProgress: (progress: ProgressState) => void;
  resetProcessing: () => void;
}

export const useProcessingStore = create<ProcessingState>((set) => ({
  isProcessing: false,
  progress: null,

  setProcessing: (value) => set({ isProcessing: value }),

  setProgress: (progress) => set({ progress }),

  resetProcessing: () =>
    set({
      isProcessing: false,
      progress: null,
    }),
}));