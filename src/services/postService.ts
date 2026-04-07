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
  id: string,
  onProgress?: (percent: number) => void,
) => {
  const blob = new Blob([await file.arrayBuffer()], { type: file.type });
  console.log(file, blob);
  const { data } = await apiClient.put(
    `/upload?id=${id}&filename=${encodeURIComponent(file.name)}`,
    file,
    {
      headers: {
        "Content-Type": file.type || "application/pdf",
      },

      onUploadProgress: (event) => {
        if (!event.total) return;
        const percent = Math.round((event.loaded * 100) / event.total);
        onProgress?.(percent);
      },
    },
  );

  return data;
};
