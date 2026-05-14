import type { RentItem } from "../../entities/rent-item";
import type { RentalCard, RentalResult } from "../../entities/rental-card";
import type { ReturnItem } from "../../entities/return-item";

export type RentalMemberCommand = {
  userId: string;
  userNm: string;
};

export type RentalItemCommand = RentalMemberCommand & {
  itemId: number;
  itemTitle: string;
};

export type ClearOverdueCommand = RentalMemberCommand & {
  point: number;
};

export interface RentalRepositoryPort {
  createRentalCard(command: RentalMemberCommand): Promise<RentalCard>;
  findRentalCard(memberId: string): Promise<RentalCard>;
  findRentItems(memberId: string): Promise<RentItem[]>;
  findReturnItems(memberId: string): Promise<ReturnItem[]>;
  rentItem(command: RentalItemCommand): Promise<RentalResult>;
  returnItem(command: RentalItemCommand): Promise<RentalResult>;
  markOverdue(command: RentalItemCommand): Promise<RentalCard>;
  clearOverdue(command: ClearOverdueCommand): Promise<RentalResult>;
}
