// types/startProcessing.ts
import type { ApiStatus } from "./base";

export interface StartProcessingRequest {
  event: "start-trigger";
  lang: string;
  file_id: string;
  status: ApiStatus; // "uploaded"
}

export interface StartProcessingResponse {
  status: ApiStatus;
  message: string;
  data?: unknown;
}
