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
  status: GetExtractionListRequest["status"],
): Promise<ExtractionItem[]> => {
  const payload: GetExtractionListRequest = {
    event: "get-list",
    file_id,
    status,
  };

  const { data } = await apiClient.post<ApiResponse<ExtractionItem[]>>(
    "/posts",
    payload,
  );

  if (!data?.data) throw new Error("Invalid API response");
  return data.data;
};

export const retryExtractionProcess = async (
  file_id: string,
  status: RetryExtractionRequest["status"],
): Promise<ExtractionItem[]> => {
  const payload: RetryExtractionRequest = {
    event: "retry-process",
    file_id,
    status,
    retry: true,
  };

  const { data } = await apiClient.post<ApiResponse<ExtractionItem[]>>(
    "/posts",
    payload,
  );

  if (!data?.data) throw new Error("Invalid API response");
  return data.data;
};
