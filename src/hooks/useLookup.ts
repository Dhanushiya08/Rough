import { useQuery } from "@tanstack/react-query";
import { getLookupList } from "../services/lookupListService";

export function useLookup(fileId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["lookup", fileId],
    queryFn: () => getLookupList(fileId, "lookup"),
    enabled,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
