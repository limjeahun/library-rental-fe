import type { BestBook } from "@domain/bestbook/entities/best-book";
import type {
  BestBookRepositoryPort,
  RecordBestBookRentCommand,
} from "@domain/bestbook/ports/driven/bestbook-repository";
import { apiRequest } from "../http/fetch-client";
import type { BestBookDto } from "./bestbook-dto";
import { toBestBook } from "./mappers/bestbook-mapper";

export class HttpBestBookRepository implements BestBookRepositoryPort {
  async findAll(): Promise<BestBook[]> {
    return (await apiRequest<BestBookDto[]>("/api/bestbook/books")).map(toBestBook);
  }

  async findById(id: number): Promise<BestBook> {
    return toBestBook(await apiRequest<BestBookDto>(`/api/bestbook/books/${id}`));
  }

  async recordRent(command: RecordBestBookRentCommand): Promise<void> {
    await apiRequest<void>("/api/bestbook/books", { method: "POST", body: command });
  }
}
