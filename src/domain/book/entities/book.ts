import type { BookStatus } from "../enums/book-status";
import type { Classification } from "../enums/classification";
import type { Location } from "../enums/location";
import type { Source } from "../enums/source";

export type Book = {
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
