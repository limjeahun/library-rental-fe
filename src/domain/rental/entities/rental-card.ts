import type { RentStatus } from "../enums/rent-status";
import type { RentItem } from "./rent-item";
import type { ReturnItem } from "./return-item";

export type RentalCard = {
  rentalCardNo: string;
  userId: string;
  userNm: string;
  rentStatus: RentStatus;
  lateFee: number;
  rentItems: RentItem[];
  returnItems: ReturnItem[];
};

export type RentalResult = RentalCard & {
  message: string;
};
