import type { RentItem } from "@domain/rental/entities/rent-item";
import type { RentalCard, RentalResult } from "@domain/rental/entities/rental-card";
import type { ReturnItem } from "@domain/rental/entities/return-item";
import type {
  ClearOverdueCommand,
  RentalItemCommand,
  RentalMemberCommand,
  RentalRepositoryPort,
} from "@domain/rental/ports/driven/rental-repository";
import { apiRequest } from "../http/fetch-client";
import type { RentItemDto, RentalCardDto, RentalResultDto, ReturnItemDto } from "./rental-dto";
import { toRentItem, toRentalCard, toRentalResult, toReturnItem } from "./mappers/rental-mapper";

export class HttpRentalRepository implements RentalRepositoryPort {
  async createRentalCard(command: RentalMemberCommand): Promise<RentalCard> {
    return toRentalCard(
      await apiRequest<RentalCardDto>("/api/rental/rental-cards", { method: "POST", body: command }),
    );
  }

  async findRentalCard(memberId: string): Promise<RentalCard> {
    return toRentalCard(await apiRequest<RentalCardDto>(`/api/rental/rental-cards/${memberId}`));
  }

  async findRentItems(memberId: string): Promise<RentItem[]> {
    return (await apiRequest<RentItemDto[]>(`/api/rental/rental-cards/${memberId}/rent-items`)).map(
      toRentItem,
    );
  }

  async findReturnItems(memberId: string): Promise<ReturnItem[]> {
    return (
      await apiRequest<ReturnItemDto[]>(`/api/rental/rental-cards/${memberId}/return-items`)
    ).map(toReturnItem);
  }

  async rentItem(command: RentalItemCommand): Promise<RentalResult> {
    return toRentalResult(
      await apiRequest<RentalResultDto>("/api/rental/rental-cards/rent", {
        method: "POST",
        body: command,
      }),
    );
  }

  async returnItem(command: RentalItemCommand): Promise<RentalResult> {
    return toRentalResult(
      await apiRequest<RentalResultDto>("/api/rental/rental-cards/return", {
        method: "POST",
        body: command,
      }),
    );
  }

  async markOverdue(command: RentalItemCommand): Promise<RentalCard> {
    return toRentalCard(
      await apiRequest<RentalCardDto>("/api/rental/rental-cards/overdue", {
        method: "POST",
        body: command,
      }),
    );
  }

  async clearOverdue(command: ClearOverdueCommand): Promise<RentalResult> {
    return toRentalResult(
      await apiRequest<RentalResultDto>("/api/rental/rental-cards/clear-overdue", {
        method: "POST",
        body: command,
      }),
    );
  }
}
