import type { RentItem } from "@domain/rental/entities/rent-item";
import type { RentalCard, RentalResult } from "@domain/rental/entities/rental-card";
import type { ReturnItem } from "@domain/rental/entities/return-item";
import type {
  ClearOverdueCommand,
  RentalItemCommand,
  RentalMemberCommand,
  RentalRepositoryPort,
} from "@domain/rental/ports/driven/rental-repository";

export class CreateRentalCardUseCase {
  constructor(private readonly repository: RentalRepositoryPort) {}

  execute(command: RentalMemberCommand): Promise<RentalCard> {
    return this.repository.createRentalCard(command);
  }
}

export class GetRentalCardUseCase {
  constructor(private readonly repository: RentalRepositoryPort) {}

  execute(memberId: string): Promise<RentalCard> {
    return this.repository.findRentalCard(memberId);
  }
}

export class GetRentItemsUseCase {
  constructor(private readonly repository: RentalRepositoryPort) {}

  execute(memberId: string): Promise<RentItem[]> {
    return this.repository.findRentItems(memberId);
  }
}

export class GetReturnItemsUseCase {
  constructor(private readonly repository: RentalRepositoryPort) {}

  execute(memberId: string): Promise<ReturnItem[]> {
    return this.repository.findReturnItems(memberId);
  }
}

export class RentItemUseCase {
  constructor(private readonly repository: RentalRepositoryPort) {}

  execute(command: RentalItemCommand): Promise<RentalResult> {
    return this.repository.rentItem(command);
  }
}

export class ReturnItemUseCase {
  constructor(private readonly repository: RentalRepositoryPort) {}

  execute(command: RentalItemCommand): Promise<RentalResult> {
    return this.repository.returnItem(command);
  }
}

export class OverdueItemUseCase {
  constructor(private readonly repository: RentalRepositoryPort) {}

  execute(command: RentalItemCommand): Promise<RentalCard> {
    return this.repository.markOverdue(command);
  }
}

export class ClearOverdueUseCase {
  constructor(private readonly repository: RentalRepositoryPort) {}

  execute(command: ClearOverdueCommand): Promise<RentalResult> {
    return this.repository.clearOverdue(command);
  }
}
