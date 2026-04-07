// services/processingService.ts
import apiClient from "./apiClient";

export const getProcessingStatus = async (file_id: string) => {
  const res = await apiClient.get(`/posts/${file_id}`);
  return res.data; // { status: "processing" | "completed" }
};
