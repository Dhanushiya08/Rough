// types/extraction.ts

import type { RequestWithEvent } from "./common";

export interface ApiResponse<T> {
  statusCode: number;
  body: {
    poNumber: string[];
    data: T;
  };
}
export type ExtractionRequest = RequestWithEvent<
  "start" | "retry",
  { retry?: number }
>;
export interface ExtractionData {
  invoice_no: string;
  amount: number;
  vendor?: string;
}

export interface ExtractionResponse {
  status: "processing" | "completed";
  message: string;
  data?: ExtractionData;
}

export interface ExtractionItem {
  key: string;
  value: string;
  originalValue?: string;
  editable?: boolean;
}


