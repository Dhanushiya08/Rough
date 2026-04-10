import type { LookupItem } from "./lookup";

export interface GetLookupListRequest {
  event: "get-list";
  file_id: string;
  state: "lookup";
}

export interface RetryLookupRequest {
  event: "retry-process";
  file_id: string;
  state: "lookup";
  file_name: string;
  lang: string;
  data: {
    poNumber: string[];
    data: LookupItem[];
  };
}

export type LookupListResponse = LookupItem[];

export type LookupEvent = "get-list" | "retry-process";
