export interface LookupItem {
  key: string;
  value: string;

  // optional fields from API
  originalValue?: string;
  editable?: boolean;
  dependsOn?: string;
}

// export interface LookupTriggerRequest {
//   event: "lookup-trigger";
//   file_id: string;
//   status: "uploaded";
// }

export type LookupEvent = "lookup-trigger" | "lookup-change" | "sap-trigger";
export interface ApiResponse<T> {
  statusCode: number;
  body: {
    poNumbers: string[];
    data: T;
  };
}
export interface LookupTriggerRequest {
  event: LookupEvent;
  file_id: string;
  status: "uploaded" | "lookup";
  data?: LookupItem[];
}

export interface GetLookupRequest {
  event: "get-list";
  file_id: string;
  state: "lookup";
}

export interface RetryLookupRequest {
  event: "retry-process";
  file_id: string;
  state: "lookup";
  file_name: string;
  data: {
    poNumbers: string[];
    data: LookupItem[];
  };
}
