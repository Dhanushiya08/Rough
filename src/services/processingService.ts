// services/processingService.ts
import apiClient from "./apiClient"; 
import type {
  StartProcessingRequest,
  StartProcessingResponse,
} from "../types/startProcessing";

export const startDocumentProcessing = async (
  payload: StartProcessingRequest,
): Promise<StartProcessingResponse> => {
  const { data } = await apiClient.post<StartProcessingResponse>(
    "/posts",
    payload,
  );

  if (!data) {
    throw new Error("Invalid API response");
  }

  return data;
};
