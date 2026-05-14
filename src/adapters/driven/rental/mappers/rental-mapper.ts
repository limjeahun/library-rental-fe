import type { RentItem } from "@domain/rental/entities/rent-item";
import type { RentalCard, RentalResult } from "@domain/rental/entities/rental-card";
import type { ReturnItem } from "@domain/rental/entities/return-item";
import type { RentItemDto, RentalCardDto, RentalResultDto, ReturnItemDto } from "../rental-dto";

export function toRentItem(dto: RentItemDto): RentItem {
  return { ...dto };
}

export function toReturnItem(dto: ReturnItemDto): ReturnItem {
  return { ...dto };
}

export function toRentalCard(dto: RentalCardDto): RentalCard {
  return {
    rentalCardNo: dto.rentalCardNo,
    userId: dto.userId,
    userNm: dto.userNm,
    rentStatus: dto.rentStatus,
    lateFee: dto.lateFee,
    rentItems: dto.rentItems.map(toRentItem),
    returnItems: dto.returnItems.map(toReturnItem),
  };
}

export function toRentalResult(dto: RentalResultDto): RentalResult {
  return {
    ...toRentalCard(dto),
    message: dto.message,
  };
}
