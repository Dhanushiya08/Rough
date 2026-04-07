// store/useAppStore.ts
import { create } from "zustand";

type AppState = {
  fileId: string;
  status: string;
  fileName: string;
  setFileId: (id: string) => void;
  setStatus: (status: string) => void;
  setFileName: (name: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
  fileId: "1234567",
  status: "",
  fileName: "",

  setFileId: (id) => set({ fileId: id }),
  setStatus: (status) => set({ status }),
  setFileName: (name) => set({ fileName: name }),
}));
