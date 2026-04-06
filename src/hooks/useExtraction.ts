import { useQuery } from "@tanstack/react-query";
import { DataExtraction } from "../services/extractionService";
import type {
  ExtractionEvent,
  // ExtractionItem
} from "../types/common";

// export function useExtraction(id: string, retry: number) {
//   return useQuery({
//     queryKey: ["extraction", id, retry],
//     queryFn: () => fetchExtraction({ id, retry }),
//     enabled: true, // ← fires automatically on mount
//     refetchOnWindowFocus: false, // ← prevents extra calls on tab focus
//     retry: false, // ← disables react-query's auto retry
//   });
// }

// export function useExtraction(fileId: string, event: "list" | "retry") {
//   return useQuery({
//     queryKey: ["extraction", fileId, event],
//     queryFn: () => fetchExtraction({ file_id: fileId, event }),
//     enabled: true,
//     refetchOnWindowFocus: false,
//     retry: false,
//   });
// }
export function useExtraction(
  fileId: string,
  event: ExtractionEvent,
  retryCount: number = 0,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["extraction", fileId, event, retryCount],
    queryFn: () => {
      const basePayload = { file_id: fileId, status: "test" };

      if (event === "get-list") {
        return DataExtraction({ event: "get-list", ...basePayload });
      }

      if (event === "retry-list") {
        return DataExtraction({
          event: "retry-list",
          ...basePayload,
          retry: retryCount,
        });
      }

      // look-up
      return DataExtraction({
        event: "look-up",
        file_id: fileId,
        status: "lookup",
      });
    },
    enabled,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
