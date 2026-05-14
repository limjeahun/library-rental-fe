import type { RentStatus } from "@domain/rental/enums/rent-status";

export type RentItemDto = {
  itemId: number;
  itemTitle: string;
  rentDate: string;
  overdue: boolean;
  overdueDate: string;
};

export type ReturnItemDto = {
  itemId: number;
  itemTitle: string;
  rentDate: string;
  returnDate: string;
};

export type RentalCardDto = {
  rentalCardNo: string;
  userId: string;
  userNm: string;
  rentStatus: RentStatus;
  lateFee: number;
  rentItems: RentItemDto[];
  returnItems: ReturnItemDto[];
};

export type RentalResultDto = RentalCardDto & {
  message: string;
};
