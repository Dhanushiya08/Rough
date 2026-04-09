import apiClient from "./apiClient";
import type {
  ApiResponse,
  ExtractionPayload,
  FileUrlPayload,
  FileUrlResponse,
} from "../types/post";
import type {
  ExtractionItem,
  ExtractionRequest,
  // getExtractionRequest,
} from "../types/extraction";
// get presigned url (left side)
// export const fetchFileUrl = async (
//   payload: FileUrlPayload,
// ): Promise<FileUrlResponse> => {
//   const { data } = await apiClient.post<{
//     data: FileUrlResponse;
//   }>("/posts", payload);

//   if (!data || !data.body) {
//     throw new Error("Invalid API response");
//   }

//   return data;
// };
export const fetchFileUrl = async (
  payload: FileUrlPayload,
): Promise<FileUrlResponse> => {
  const { data } = await apiClient.post<FileUrlResponse>("/posts", payload);
  console.log(data);

  if (!data || !data.body) {
    throw new Error("Invalid API response");
  }

  return data;
};
//triggerExtraction  (upload page)
export const triggerExtraction = async (
  payload: ExtractionRequest,
): Promise<ExtractionItem[]> => {
  const { data } = await apiClient.post<ApiResponse<ExtractionItem[]>>(
    "/posts",
    payload,
  );

  if (!data || !data.data) {
    throw new Error("Invalid API response");
  }

  return data.data;
};

// export const DataExtraction = async (
//   payload: getExtractionRequest,
// ): Promise<ExtractionItem[]> => {
//   const { data } = await apiClient.post<ApiResponse<ExtractionItem[]>>(
//     "/posts",
//     payload,
//   );

//   if (!data || !data.data) {
//     throw new Error("Invalid API response");
//   }

//   return data.data;
// };

export const fetchExtraction = async (
  payload: ExtractionRequest,
): Promise<ExtractionItem[]> => {
  const { data } = await apiClient.post<ApiResponse<ExtractionItem[]>>(
    "/posts",
    payload,
  );

  if (!data || !data.data) {
    throw new Error("Invalid API response");
  }

  return data.data;
};

export const getExtraction = async (
  payload: ExtractionPayload,
): Promise<ExtractionItem[]> => {
  const { data } = await apiClient.post<ApiResponse<ExtractionItem[]>>(
    "/posts",
    payload,
  );

  if (!data?.data) {
    throw new Error("Invalid API response");
  }

  return data.data;
};
