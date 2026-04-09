// services/extractionListService.ts
import apiClient from "./apiClient";
import type { ApiResponse } from "../types/extraction";
import type { ExtractionItem } from "../types/extraction";
import type {
  GetExtractionListRequest,
  RetryExtractionRequest,
} from "../types/extractionList";
// Lang

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

  const body = data?.body;

  console.log(body);
  if (data?.statusCode !== 200) {
    throw new Error("API failed");
  }
  // if (!body) throw new Error("Invalid API response");

  return {
    poNumbers: body.poNumbers ?? [],
    data: body.data ?? [],
  };
};

export const retryExtractionProcess = async (
  file_id: string,
  state: RetryExtractionRequest["state"],
  file_name: string,
  lang: string,
): Promise<{
  poNumbers: string[];
  data: ExtractionItem[];
}> => {
  const payload: RetryExtractionRequest = {
    event: "retry-process",
    file_id,
    state,
    file_name,
    lang,
  };

  const { data } = await apiClient.post<ApiResponse<ExtractionItem[]>>(
    "/posts",
    payload,
  );

  const body = data?.body;

  console.log(body);
  if (data?.statusCode !== 200) {
    throw new Error("API failed");
  }

  return {
    poNumbers: body.poNumbers ?? [],
    data: body.data ?? [],
  };
};
