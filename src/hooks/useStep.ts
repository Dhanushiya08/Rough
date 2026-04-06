// hooks/useStep.ts
import { useContext } from "react";
import { StepContext } from "../context/StepContext";

// Clean hook — call this in any child component to
// navigate without prop drilling
export function useStep() {
  return useContext(StepContext);
}

// Usage in any component:
//   const { goNext, goPrev, current } = useStep();
