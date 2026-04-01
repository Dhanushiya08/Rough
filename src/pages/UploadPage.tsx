import { useQuery } from "@tanstack/react-query";
import { fetchPosts } from "../services/postService";

export default function UploadPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  if (isLoading) return <p>Loading...</p>;

  if (error) return <p>Error loading data</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">API Data</h1>

      {data?.slice(0, 5).map((post) => (
        <div key={post.id} className="border p-2 mb-2 rounded">
          {post.title}
        </div>
      ))}
    </div>
  );
}
