import type { BestBook } from "@domain/bestbook/entities/best-book";
import type {
  BestBookRepositoryPort,
  RecordBestBookRentCommand,
} from "@domain/bestbook/ports/driven/bestbook-repository";

export class GetAllBestBooksUseCase {
  constructor(private readonly repository: BestBookRepositoryPort) {}

  execute(): Promise<BestBook[]> {
    return this.repository.findAll();
  }
}

export class GetBestBookByIdUseCase {
  constructor(private readonly repository: BestBookRepositoryPort) {}

  execute(id: number): Promise<BestBook> {
    return this.repository.findById(id);
  }
}

export class RecordBestBookRentUseCase {
  constructor(private readonly repository: BestBookRepositoryPort) {}

  execute(command: RecordBestBookRentCommand): Promise<void> {
    return this.repository.recordRent(command);
  }
}
