import type { BookStatus } from "@domain/book/enums/book-status";
import type { Classification } from "@domain/book/enums/classification";
import type { Location } from "@domain/book/enums/location";
import type { Source } from "@domain/book/enums/source";

export type BookDto = {
  no: number;
  title: string;
  description: string;
  author: string;
  isbn: string;
  publicationDate: string;
  source: Source;
  classification: Classification;
  bookStatus: BookStatus;
  location: Location;
};
