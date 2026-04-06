// types/reconciliation.ts
import type { BaseRequest } from "./base";

export type SourceType = "sap" | "extracted";

export interface ReconciliationItem {
  field: string;
  selected_source: SourceType;
  value?: string;
}

export interface ReconciliationRequest extends BaseRequest {
  event: "submit";
  data: ReconciliationItem[];
}

export interface ReconciliationResponse {
  status: "reconciled";
  message: string;
}
