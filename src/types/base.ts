// src/types/base.ts
export type ApiEvent = "start" | "retry" | "lookup" | "submit" | "final_submit";

export type ApiStatus =
  | "uploaded"
  | "processing"
  | "completed"
  | "failed"
  | "lookup_trigger"
  | "reconciled"
  | "parked"
  | "extract"

export interface BaseRequest {
  file_id: string;
  event: ApiEvent;
}
