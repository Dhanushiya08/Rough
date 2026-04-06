// // context/StepContext.tsx
// import { createContext, useState } from "react";

// interface StepContextType {
//   current: number;
//   totalSteps: number;
//   goNext: () => void;
//   goPrev: () => void;
//   goTo: (step: number) => void;
// }

// export const StepContext = createContext<StepContextType>(null!);

// export function StepProvider({
//   children,
//   totalSteps,
// }: {
//   children: React.ReactNode;
//   totalSteps: number;
// }) {
//   const [current, setCurrent] = useState<number>(1);

//   const goNext = () => setCurrent((c) => Math.min(c + 1, totalSteps));
//   const goPrev = () => setCurrent((c) => Math.max(c - 1, 1));
//   const goTo = (step: number) => setCurrent(step);

//   return (
//     <StepContext.Provider value={{ current, totalSteps, goNext, goPrev, goTo }}>
//       {children}
//     </StepContext.Provider>
//   );
// }
import { useState } from "react";
import { StepContext } from "./StepContext";

export function StepProvider({
  children,
  totalSteps,
}: {
  children: React.ReactNode;
  totalSteps: number;
}) {
  const [current, setCurrent] = useState<number>(1);

  const goNext = () => setCurrent((c) => Math.min(c + 1, totalSteps));
  const goPrev = () => setCurrent((c) => Math.max(c - 1, 1));
  const goTo = (step: number) => setCurrent(step);

  return (
    <StepContext.Provider value={{ current, totalSteps, goNext, goPrev, goTo }}>
      {children}
    </StepContext.Provider>
  );
}
