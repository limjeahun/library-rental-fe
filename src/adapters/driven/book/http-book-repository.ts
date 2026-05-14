import type { Book } from "@domain/book/entities/book";
import type {
  BookRepositoryPort,
  RegisterBookCommand,
} from "@domain/book/ports/driven/book-repository";
import { apiRequest } from "../http/fetch-client";
import type { BookDto } from "./book-dto";
import { toBook } from "./mappers/book-mapper";

export class HttpBookRepository implements BookRepositoryPort {
  async register(command: RegisterBookCommand): Promise<Book> {
    return toBook(await apiRequest<BookDto>("/api/book", { method: "POST", body: command }));
  }

  async findByNo(no: number): Promise<Book> {
    return toBook(await apiRequest<BookDto>(`/api/book/${no}`));
  }

  async makeAvailable(no: number): Promise<Book> {
    return toBook(await apiRequest<BookDto>(`/api/book/${no}/available`, { method: "POST" }));
  }

  async makeUnavailable(no: number): Promise<Book> {
    return toBook(await apiRequest<BookDto>(`/api/book/${no}/unavailable`, { method: "POST" }));
  }
}
