import { useQuery } from "@tanstack/react-query";
// import type { LookupEvent } from "../types/lookupList";
import {
  getLookupList,
  // retryLookupProcess,
} from "../services/lookupListService";
// export function useLookup(
//   fileId: string,
//   fileName: string,
//   event: LookupEvent,
//   enabled: boolean = true,
// ) {
//   return useQuery({
//     queryKey: ["lookup", fileId, event],
//     queryFn: () => {
//       if (event === "get-list") {
//         return getLookupList(fileId, "lookup");
//       }

//       // if (event === "retry-process") {
//       //   return retryLookupProcess(fileId, "lookup", fileName);
//       // }

//       return getLookupList(fileId, "lookup");
//     },
//     enabled,
//     refetchOnWindowFocus: false,
//     retry: false,
//   });
// }
export function useLookup(fileId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["lookup", fileId],
    queryFn: () => getLookupList(fileId, "lookup"),
    enabled,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
