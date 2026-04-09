import apiClient from "./apiClient";
type ApiTableItem = {
  file_id: string;
  file_name: string;
  state: string; // raw → string
  status: string; // raw → string
  lang: string;
};
const validStates = ["extract", "lookup", "sap", "park"] as const;
const validStatuses = [
  "pending",
  "processing",
  "waiting",
  "completed",
  "failed",
] as const;

export type DataType = {
  file_id: string;
  file_name: string;
  state: (typeof validStates)[number];
  status: (typeof validStatuses)[number];
};

export const getTableData = async (): Promise<DataType[]> => {
  const response = await apiClient.post("/posts", {
    event: "get-table-data",
  });

  const rawData: ApiTableItem[] = response.data?.body?.data || [];

  const formattedData: DataType[] = rawData
    .map((item) => {
      const state = item.state?.toLowerCase();
      const status = item.status?.toLowerCase();

      if (
        validStates.includes(state as DataType["state"]) &&
        validStatuses.includes(status as DataType["status"])
      ) {
        return {
          file_id: item.file_id,
          file_name: item.file_name,
          state: state as DataType["state"],
          status: status as DataType["status"],
        };
      }

      return null;
    })
    .filter((item): item is DataType => item !== null);

  return formattedData;
};
