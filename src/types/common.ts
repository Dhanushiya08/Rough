// types/base.ts
// export type ApiStatus =
//   | "uploaded"
//   | "processing"
//   | "completed"
//   | "failed"
//   | "lookup_trigger"
//   | "reconciled"
//   | "parked";

// export type ApiEvent = "start" | "retry" | "lookup" | "submit" | "final_submit";

// export interface BaseRequest {
//   file_id: string;
//   event?: ApiEvent;
// }

// export interface BaseResponse<T = unknown> {
//   status: ApiStatus | "error";
//   message: string;
//   data?: T;
//   error_code?: string;
// }
// types/common.ts
import type { BaseRequest } from "./base";
export type RequestWithEvent<
  TEvent extends string,
  TExtra extends Record<string, unknown> = Record<string, never>,
> = BaseRequest & {
  event: TEvent;
} & TExtra;

export interface Step {
  id: number;
  label: string;
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
  poNumber?: string;
}

export type LineItem = Record<string, unknown>;

export interface LineItemsTableProps {
  data: LineItem[];
  selectedPO: string;
}
export type ExtractionEvent = "get-list" | "retry-process" | "look-up";

export type ExtractionRequest =
  | { event: "get-list"; file_id: string; status: "extract" }
  | { event: "retry-process"; file_id: string; extract: string; retry: number }
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
