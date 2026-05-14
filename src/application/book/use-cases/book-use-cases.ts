import type { Book } from "@domain/book/entities/book";
import type {
  BookRepositoryPort,
  RegisterBookCommand,
} from "@domain/book/ports/driven/book-repository";

export class RegisterBookUseCase {
  constructor(private readonly repository: BookRepositoryPort) {}

  execute(command: RegisterBookCommand): Promise<Book> {
    return this.repository.register(command);
  }
}

export class GetBookUseCase {
  constructor(private readonly repository: BookRepositoryPort) {}

  execute(no: number): Promise<Book> {
    return this.repository.findByNo(no);
  }
}

export class MakeBookAvailableUseCase {
  constructor(private readonly repository: BookRepositoryPort) {}

  execute(no: number): Promise<Book> {
    return this.repository.makeAvailable(no);
  }
}

export class MakeBookUnavailableUseCase {
  constructor(private readonly repository: BookRepositoryPort) {}

  execute(no: number): Promise<Book> {
    return this.repository.makeUnavailable(no);
  }
}
