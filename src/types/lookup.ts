// // types/lookup.ts
// import type { BaseRequest } from "./base";

// export interface LookupRequest extends BaseRequest {
//   event: "lookup";
// }

// export interface LookupItem {
//   po_number: string;
//   vendor: string;
// }

// export interface LookupResponse {
//   status: "lookup_trigger";
//   data: LookupItem[];
//   message: string;
// }

import type { RequestWithEvent } from "./common";

export type LookupTriggerRequest = RequestWithEvent<
  "lookup-trigger",
  { status: "uploaded" }
>;
export interface LookupTriggerResponse {
  status: "processing" | "completed";
  message: string;
}
export interface LookupItem {
  key: string;
  value: string;
}