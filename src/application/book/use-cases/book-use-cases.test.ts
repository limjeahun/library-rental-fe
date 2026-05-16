import { describe, expect, it, vi } from "vitest";
import { GetBooksUseCase, RegisterBookUseCase } from "./book-use-cases";
import type { BookRepositoryPort } from "@domain/book/ports/driven/book-repository";

describe("RegisterBookUseCase", () => {
  it("delegates registration to repository port", async () => {
    const repository: BookRepositoryPort = {
      register: vi.fn().mockResolvedValue({
        no: 1,
        title: "테스트 도서",
        description: "설명",
        author: "작가",
        isbn: "isbn",
        publicationDate: "2026-05-14",
        source: "SUPPLY",
        classification: "COMPUTER",
        bookStatus: "ENTERED",
        location: "PANGYO",
      }),
      findAll: vi.fn(),
      findByNo: vi.fn(),
      makeAvailable: vi.fn(),
      makeUnavailable: vi.fn(),
    };
    const useCase = new RegisterBookUseCase(repository);

    const result = await useCase.execute({
      title: "테스트 도서",
      description: "설명",
      author: "작가",
      isbn: "isbn",
      publicationDate: "2026-05-14",
      source: "SUPPLY",
      classification: "COMPUTER",
      location: "PANGYO",
    });

    expect(repository.register).toHaveBeenCalledOnce();
    expect(result.no).toBe(1);
  });
});

describe("GetBooksUseCase", () => {
  it("delegates list lookup to repository port", async () => {
    const repository: BookRepositoryPort = {
      register: vi.fn(),
      findAll: vi.fn().mockResolvedValue([
        {
          no: 1,
          title: "테스트 도서",
          description: "설명",
          author: "작가",
          isbn: "isbn",
          publicationDate: "2026-05-14",
          source: "SUPPLY",
          classification: "COMPUTER",
          bookStatus: "AVAILABLE",
          location: "PANGYO",
        },
      ]),
      findByNo: vi.fn(),
      makeAvailable: vi.fn(),
      makeUnavailable: vi.fn(),
    };
    const useCase = new GetBooksUseCase(repository);

    const result = await useCase.execute();

    expect(repository.findAll).toHaveBeenCalledOnce();
    expect(result).toHaveLength(1);
  });
});
