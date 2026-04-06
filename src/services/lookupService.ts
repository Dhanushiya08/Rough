// types/lookup.ts
import type {
  LookupItem,
  LookupTriggerRequest,
  LookupTriggerResponse,
} from "../types/lookup";
import type { ApiResponse } from "../types/post";

import apiClient from "./apiClient";

export const triggerLookupProcess = async (
  file_id: string,
  status: LookupTriggerRequest["status"],
): Promise<LookupItem[]> => {
  const payload: LookupTriggerRequest = {
    event: "lookup-trigger",
    file_id,
    status,
  };

  const { data } = await apiClient.post<ApiResponse<LookupItem[]>>(
    "/posts",
    payload,
  );

  if (!data?.data) throw new Error("Invalid API response");
  return data.data;
};
