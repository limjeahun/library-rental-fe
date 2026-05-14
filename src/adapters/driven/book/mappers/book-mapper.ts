import type { Book } from "@domain/book/entities/book";
import type { BookDto } from "../book-dto";

export function toBook(dto: BookDto): Book {
  return { ...dto };
}
