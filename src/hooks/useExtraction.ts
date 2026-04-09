import { useQuery } from "@tanstack/react-query";
import type { ExtractionEvent } from "../types/extractionList";
import {
  getExtractionList,
  retryExtractionProcess,
} from "../services/extractionListService";
import { useAppStore } from "../store/useAppStore";

export function useExtraction(
  fileId: string,
  fileName: string,
  event: ExtractionEvent,
  retryCount: number = 0,
  enabled: boolean = true,
) {
  const lang = useAppStore((s) => s.lang);
  return useQuery({
    queryKey: ["extraction", fileId, event, retryCount],
    queryFn: () => {
      if (event === "get-list") {
        return getExtractionList(fileId, "extract");
      }

      if (event === "retry-process") {
        return retryExtractionProcess(fileId, "extract", fileName, lang);
      }

      return getExtractionList(fileId, "extract");
    },
    enabled,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
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
// export function useExtraction(
//   fileId: string,
//   event: ExtractionEvent,
//   retryCount: number = 0,
//   enabled: boolean = true,
// ) {
//   return useQuery({
//     queryKey: ["extraction", fileId, event, retryCount],
//     queryFn: () => {
//       const basePayload = { file_id: fileId, status: "test" };

//       if (event === "get-list") {
//         return DataExtraction({ event: "get-list", ...basePayload });
//       }

//       if (event === "retry-process") {
//         return DataExtraction({
//           event: "retry-process",
//           ...basePayload,
//           retry: retryCount,
//         });
//       }

//       // look-up
//       return DataExtraction({
//         event: "look-up",
//         file_id: fileId,
//         status: "lookup",
//       });
//     },
//     enabled,
//     refetchOnWindowFocus: false,
//     retry: false,
//   });
// }
