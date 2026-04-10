import apiClient from "./apiClient";
type ApiResponse = {
  body:
    | {
        data: ApiTableItem[];
        message: string;
        statusCode: number;
      }
    | string; 
  statusCode?: number;
};
type ApiTableItem = {
  file_id: string;
  file_name: string;
  state: string; 
  status: string;
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
const validLangs = ["english", "bahasa", "mandarin"] as const;
export type DataType = {
  file_id: string;
  file_name: string;
  state: (typeof validStates)[number];
  status: (typeof validStatuses)[number];
  lang: (typeof validLangs)[number];
};
const isValidState = (value: unknown): value is DataType["state"] =>
  typeof value === "string" && validStates.includes(value as DataType["state"]);

const isValidStatus = (value: unknown): value is DataType["status"] =>
  typeof value === "string" &&
  validStatuses.includes(value as DataType["status"]);

const isValidLang = (value: unknown): value is DataType["lang"] =>
  typeof value === "string" && validLangs.includes(value as DataType["lang"]);

export const getTableData = async (): Promise<DataType[]> => {
  const response = await apiClient.post<ApiResponse>("/posts", {
    event: "get-table-data",
  });

  const rawBody = response.data?.body;
  const parsedBody =
    typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;

  const rawData = parsedBody?.data;

  if (!Array.isArray(rawData)) {
    console.warn("Expected array, got:", typeof rawData, rawData);
    return [];
  }

  const formattedData: DataType[] = rawData
    .map((item): DataType | null => {
      const state = item.state?.toLowerCase();
      const status = item.status?.toLowerCase();
      const lang = item.lang?.toLowerCase();

      if (isValidState(state) && isValidStatus(status) && isValidLang(lang)) {
        return {
          file_id: item.file_id,
          file_name: item.file_name,
          state,
          status,
          lang,
        };
      }

      console.warn("Filtered out item (invalid fields):", item);
      return null;
    })
    .filter((item): item is DataType => item !== null);

  return formattedData;
};
