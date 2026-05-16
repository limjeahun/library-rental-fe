import type { Book } from "../../entities/book";
import type { Classification } from "../../enums/classification";
import type { Location } from "../../enums/location";
import type { Source } from "../../enums/source";

export type RegisterBookCommand = {
  title: string;
  description: string;
  author: string;
  isbn: string;
  publicationDate: string;
  source: Source;
  classification: Classification;
  location: Location;
};

export interface BookRepositoryPort {
  register(command: RegisterBookCommand): Promise<Book>;
  findAll(): Promise<Book[]>;
  findByNo(no: number): Promise<Book>;
  makeAvailable(no: number): Promise<Book>;
  makeUnavailable(no: number): Promise<Book>;
}
