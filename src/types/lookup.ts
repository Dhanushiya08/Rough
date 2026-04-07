export interface LookupItem {
  key: string;
  value: string;
}

// export interface LookupTriggerRequest {
//   event: "lookup-trigger";
//   file_id: string;
//   status: "uploaded";
// }

export type LookupEvent = "lookup-trigger" | "lookup-change" | "sap-trigger";

export interface LookupTriggerRequest {
  event: LookupEvent;
  file_id: string;
  status: "uploaded" | "lookup";
  data?: LookupItem[]; // optional for change case
}