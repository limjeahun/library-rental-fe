import type { BestBook } from "@domain/bestbook/entities/best-book";
import type { BestBookDto } from "../bestbook-dto";

export function toBestBook(dto: BestBookDto): BestBook {
  return { ...dto };
}
