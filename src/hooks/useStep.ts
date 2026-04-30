import { useContext } from "react";
import { StepContext } from "../context/StepContext";

export function useStep() {
  return useContext(StepContext);
}
