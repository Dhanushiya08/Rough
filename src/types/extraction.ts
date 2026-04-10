// types/extraction.ts
// import type { BaseRequest } from "./base";

// export interface ExtractionRequest extends BaseRequest {
//   event: "start" | "retry";
//   retry?: number;
// }
import type { RequestWithEvent } from "./common";
// export interface ApiResponse<T> {
//   response: {
//     statusCode: number;
//     body: {
//       poNumber: string[];
//       data: T;
//     };
//   };
// }
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

// export interface ExtractionRequest {
//   id?: string;
//   retry?: number;
//   file_id: string;
//   lang: string;
//   status: string;
// }
// export interface getExtractionRequest {
//   file_id: string;
//   status?: string;
//   event: "get-list" | "retry-process" | "look-up";
//   retry?: number;
// }
