// types/reconciliation.ts
import type { BaseRequest } from "./base";

export type SourceType = "sap" | "extracted";

// export interface ReconciliationItem {
//   field: string;
//   selected_source: SourceType;
//   value?: string;
// }

export interface ReconciliationRequest extends BaseRequest {
  event: "submit";
  data: ReconciliationItem[];
}

export interface ReconciliationResponse {
  status: "reconciled";
  message: string;
}
export type ReconciliationItem = {
  key: string;
  label: string;
  extractedValue: string;
  sapValue: string;
  value: string;
  originalValue: string;
  source: "sap" | "extracted" | null;
  poNumber?: string;
};
export type SapReconcileApiItem = {
  field: string;
  extracted?: string;
  sap?: string;
  selected?: "sap" | "extracted" | null;
  poNumber?: string;
};
export type LineItem = Record<string, unknown> & {
  genaiSelected?: boolean;
};

