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
  enabled: boolean = true,
) {
  const lang = useAppStore((s) => s.lang);
  return useQuery({
    queryKey: ["extraction", fileId, event],
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
