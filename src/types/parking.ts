// types/parking.ts
import type { BaseRequest } from "./base";

export interface ParkingRequest extends BaseRequest {
  event: "final_submit";
}

export interface ParkingResponse {
  status: "parked";
  message: string;
}

export interface ParkRequest extends BaseRequest {
  event: "submit";
  data: ParkItem[];
}

export interface ParkResponse {
  status: "park";
  message: string;
}
export type ParkItem = {
  key: string;
  label: string;
  extractedValue: string;
  sapValue: string;
  value: string;
  originalValue: string;
  source: "sap" | "extracted" | null;
};
export type ParkApiItem = {
  field: string;
  extracted?: string;
  sap?: string;
  selected?: "sap" | "extracted" | null;
};
export type LineItem = Record<string, unknown> & {
  genaiSelected?: boolean;
};