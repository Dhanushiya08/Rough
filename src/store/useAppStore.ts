// store/useAppStore.ts
import { create } from "zustand";

type AppState = {
  fileId: string;
  status: string;
  setFileId: (id: string) => void;
  setStatus: (status: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
  fileId: "1234567",
  status: "",

  setFileId: (id) => set({ fileId: id }),
  setStatus: (status) => set({ status }),
}));

// import { useAppStore } from "../store/useAppStore";

// const MyComponent = () => {
//   const fileId = useAppStore((s) => s.fileId);
//   const setFileId = useAppStore((s) => s.setFileId);

//   return (
//     <button onClick={() => setFileId("123")}>
//       FileId: {fileId}
//     </button>
//   );
// };
