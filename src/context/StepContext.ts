import { createContext } from "react";

export interface StepContextType {
  current: number;
  totalSteps: number;
  goNext: () => void;
  goPrev: () => void;
  goTo: (step: number) => void;
}

export const StepContext = createContext<StepContextType>(null!);
