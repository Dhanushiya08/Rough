import { useMutation } from "@tanstack/react-query";
import { createPost } from "../services/postService";
import { useState } from "react";

export default function CreatePostPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: (data) => {
      console.log("Created:", data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    mutation.mutate({
      title,
      body,
      userId: 1,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-3">
      <input
        className="border p-2 w-full"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        className="border p-2 w-full"
        placeholder="Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Create Post
      </button>
    </form>
  );
}
