export type PromptType = "Base Prompt" | "Consolidation Prompt" | "Classification Prompt" | "Main Prompt";
export type PromptStatus = "Active" | "Draft" | "Archived";
export type BusinessGroup = "Apical" | "Sateri" | "Asia Agri" | "RAPP" | "APRIL" | "Global";

export interface PromptVersion {
  id: string;
  name: string;
  type: PromptType;
  business: BusinessGroup;
  version: number;
  status: PromptStatus;
  description: string;
  content: string;
  createdAt: string;
  createdBy: string;
}
