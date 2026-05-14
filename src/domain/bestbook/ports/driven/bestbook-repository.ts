import type { BestBook } from "../../entities/best-book";

export type RecordBestBookRentCommand = {
  itemNo: number;
  itemTitle: string;
};

export interface BestBookRepositoryPort {
  findAll(): Promise<BestBook[]>;
  findById(id: number): Promise<BestBook>;
  recordRent(command: RecordBestBookRentCommand): Promise<void>;
}
