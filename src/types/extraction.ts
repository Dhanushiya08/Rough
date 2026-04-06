export interface ExtractionItem {
  key: string;
  value: string;
}

export interface ExtractionRequest {
  id?: string;
  retry?: number;
  file_id: string;
  lang: string;
}
export interface getExtractionRequest {
  file_id: string;
  status?: string;
  event: "get-list" | "retry-list" | "look-up"; 
  retry?: number;
}

