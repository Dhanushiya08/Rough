import apiClient from "./apiClient";
import type { ApiResponse } from "../types/lookup";
import type { LookupItem } from "../types/lookup";
import type {
  GetLookupListRequest,
  RetryLookupRequest,
} from "../types/lookupList";
export const getLookupList = async (
  file_id: string,
  state: GetLookupListRequest["state"],
): Promise<{
  poNumbers: string[];
  data: LookupItem[];
}> => {
  const payload: GetLookupListRequest = {
    event: "get-list",
    file_id,
    state,
  };

  const { data } = await apiClient.post<ApiResponse<LookupItem[]>>(
    "/posts",
    payload,
  );
  console.log(data);
  const body = data?.response?.body;
  if (!body) throw new Error("Invalid API response");

  return {
    poNumbers: body.poNumbers ?? [],
    data: body.data ?? [],
  };
};

export const retryLookupProcess = async (
  file_id: string,
  state: RetryLookupRequest["state"],
  file_name: string,
  payloadData: {
    poNumbers: string[];
    data: LookupItem[];
  },
): Promise<{
  poNumbers: string[];
  data: LookupItem[];
}> => {
  const payload: RetryLookupRequest = {
    event: "retry-process",
    file_id,
    state,
    file_name,
    data: payloadData, 
  };

  const { data } = await apiClient.post<ApiResponse<LookupItem[]>>(
    "/posts",
    payload,
  );

  const body = data?.response?.body;
  if (!body) throw new Error("Invalid API response");

  return {
    poNumbers: body.poNumbers ?? [],
    data: body.data ?? [],
  };
};
