import apiClient from "./apiClient";
import { type Post, type PostInput } from "../types/post";

export const fetchPosts = async (): Promise<Post[]> => {
  const { data } = await apiClient.get<Post[]>("/posts");
  return data;
};
export const createPost = async (post: PostInput): Promise<Post> => {
  const { data } = await apiClient.post<Post>("/posts", post);
  return data;
};
export const uploadDocument = async (
  file: File,
  onProgress?: (percent: number) => void,
) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.put("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (event) => {
      if (!event.total) return;
      const percent = Math.round((event.loaded * 100) / event.total);
      onProgress?.(percent);
    },
  });

  return data;
};
