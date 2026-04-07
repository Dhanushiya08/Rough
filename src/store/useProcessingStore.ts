// store/useProcessingStore.ts
import { create } from "zustand";

interface ProcessingState {
  isProcessing: boolean;
  setProcessing: (value: boolean) => void;
}

export const useProcessingStore = create<ProcessingState>((set) => ({
  isProcessing: false,
  setProcessing: (value) => set({ isProcessing: value }),
}));
