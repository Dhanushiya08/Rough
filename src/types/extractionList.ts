// types/extractionList.ts
// import type { ApiStatus } from "./base";
import type { ExtractionItem } from "./extraction";

export interface GetExtractionListRequest {
  event: "get-list";
  file_id: string;
  state: "extract";
}

export interface RetryExtractionRequest {
  event: "retry-process";
  file_id: string;
  state: "extract";
  file_name: string;
}

export type ExtractionListResponse = ExtractionItem[];

export type ExtractionEvent = "get-list" | "retry-process" | "look-up";
