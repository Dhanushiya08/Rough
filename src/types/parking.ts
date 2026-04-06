// types/parking.ts
import type { BaseRequest } from "./base";

export interface ParkingRequest extends BaseRequest {
  event: "final_submit";
}

export interface ParkingResponse {
  status: "parked";
  message: string;
}
