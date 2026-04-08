// services/extractionListService.ts
import apiClient from "./apiClient";
import type { ApiResponse } from "../types/extraction";
import type { ExtractionItem } from "../types/extraction";
import type {
  GetExtractionListRequest,
  RetryExtractionRequest,
} from "../types/extractionList";

export const getExtractionList = async (
  file_id: string,
  state: GetExtractionListRequest["state"],
): Promise<{
  poNumbers: string[];
  data: ExtractionItem[];
}> => {
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

  const body = data?.response?.body;

  if (!body) throw new Error("Invalid API response");

  return {
    poNumbers: body.poNumbers ?? [],
    data: body.data ?? [],
  };
};

export const retryExtractionProcess = async (
  file_id: string,
  state: RetryExtractionRequest["state"],
  file_name: string,
): Promise<{
  poNumbers: string[];
  data: ExtractionItem[];
}> => {
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

  const body = data?.response?.body;

  if (!body) throw new Error("Invalid API response");

  return {
    poNumbers: body.poNumbers ?? [],
    data: body.data ?? [],
  };
};
