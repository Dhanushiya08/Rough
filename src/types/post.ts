export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
export interface FileUrlPayload {
  file_id: string;
  event: string;
}

export interface FileUrlResponse {
  file_url: string;
  file_type?: string;
}

export interface PostInput {
  title: string;
  body: string;
  userId: number;
}

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}
export interface  ExtractionPayload = {
  file_id: string;
  event: "list" | "retry";
  retry?: number; // optional
};
