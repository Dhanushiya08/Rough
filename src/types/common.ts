export interface Step {
  id: number;
  label: string;
  description: string;
  component: React.ReactNode;
}
export type ExtractedItem = {
  key: string;
  value: string;
  originalValue?: string;
  editable?: boolean;
  dependsOn?: string;
  loading?: boolean;
};
export interface ReconciliationItem {
  key: string;
  label: string;
  extractedValue: string;
  sapValue: string;
  value: string;
  originalValue: string;
  source: "extracted" | "sap" | null;
}

export type LineItem = Record<string, unknown>;

export interface LineItemsTableProps {
  data: LineItem[];
  selectedPO: string;
}
export type ExtractionEvent = "get-list" | "retry-list" | "look-up";

export type ExtractionRequest =
  | { event: "get-list"; file_id: string; status: string }
  | { event: "retry-list"; file_id: string; status: string; retry: number }
  | { event: "look-up"; file_id: string; status: string };
// export type StepComponentProps = {
//   goNext: () => void;
//   goPrev: () => void;
//   goTo: (step: number) => void;
//   current: number;
// };
// import type { ComponentType } from "react";

// export type StepComponentProps = {
//   goNext: () => void;
//   goPrev: () => void;
//   goTo: (step: number) => void;
//   current: number;
// };

// export type Step = {
//   id: number;
//   label: string;
//   description: string;
//   component: ComponentType<StepComponentProps>;
// };
