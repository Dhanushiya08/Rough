// services/extractionListService.ts
import apiClient from "./apiClient";
import type { ApiResponse } from "../types/post";
import type { ExtractionItem } from "../types/extraction";
import type {
  GetExtractionListRequest,
  RetryExtractionRequest,
} from "../types/extractionList";

export const getExtractionList = async (
  file_id: string,
  state: GetExtractionListRequest["state"],
): Promise<ExtractionItem[]> => {
  const payload: GetExtractionListRequest = {
    event: "get-list",
    file_id,
    state,
  };

  const { data } = await apiClient.post<ApiResponse<ExtractionItem[]>>(
    "/posts",
    payload,
  );
  console.log(data);

  if (!data?.data) throw new Error("Invalid API response");
  console.log(data);
  return data.data;
};

export const retryExtractionProcess = async (
  file_id: string,
  state: RetryExtractionRequest["state"],
  file_name: string,
): Promise<ExtractionItem[]> => {
  const payload: RetryExtractionRequest = {
    event: "retry-process",
    file_id,
    state,
    file_name,
  };

  const { data } = await apiClient.post<ApiResponse<ExtractionItem[]>>(
    "/posts",
    payload,
  );

  if (!data?.data) throw new Error("Invalid API response");
  return data.data;
};
