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
  poNumber: string[];
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
  const body = data?.body;
  console.log(body);
  if (data?.statusCode !== 200) {
    throw new Error("API failed");
  }

  return {
    poNumber: body.poNumber ?? [],
    data: body.data ?? [],
  };
};

export const retryLookupProcess = async (
  file_id: string,
  state: RetryLookupRequest["state"],
  file_name: string,
  lang: string,
  payloadData: {
    poNumber: string[];
    data: LookupItem[];
  },
): Promise<{
  poNumber: string[];
  data: LookupItem[];
}> => {
  const payload: RetryLookupRequest = {
    event: "retry-process",
    file_id,
    state,
    file_name,
    lang,
    data: payloadData,
  };

  const { data } = await apiClient.post<ApiResponse<LookupItem[]>>(
    "/posts",
    payload,
  );

  const body = data?.body;
  console.log(body);
  if (data?.statusCode !== 200) {
    throw new Error("API failed");
  }

  return {
    poNumber: body.poNumber ?? [],
    data: body.data ?? [],
  };
};
