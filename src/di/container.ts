import {
  GetAllBestBooksUseCase,
  GetBestBookByIdUseCase,
  RecordBestBookRentUseCase,
} from "@application/bestbook/use-cases/bestbook-use-cases";
import {
  GetBookUseCase,
  GetBooksUseCase,
  MakeBookAvailableUseCase,
  MakeBookUnavailableUseCase,
  RegisterBookUseCase,
} from "@application/book/use-cases/book-use-cases";
import { GetTopicFlowsUseCase } from "@application/event-flow/use-cases/get-topic-flows";
import {
  GetMemberByIdUseCase,
  GetMemberUseCase,
  RegisterMemberUseCase,
  SavePointUseCase,
  UsePointUseCase,
} from "@application/member/use-cases/member-use-cases";
import {
  ClearOverdueUseCase,
  CreateRentalCardUseCase,
  GetRentalCardUseCase,
  GetRentItemsUseCase,
  GetReturnItemsUseCase,
  OverdueItemUseCase,
  RentItemUseCase,
  ReturnItemUseCase,
} from "@application/rental/use-cases/rental-use-cases";
import { HttpBestBookRepository } from "@adapters/driven/bestbook/http-bestbook-repository";
import { HttpBookRepository } from "@adapters/driven/book/http-book-repository";
import { HttpMemberRepository } from "@adapters/driven/member/http-member-repository";
import { HttpRentalRepository } from "@adapters/driven/rental/http-rental-repository";

export type AppContainer = ReturnType<typeof createContainer>;

export function createContainer() {
  const bookRepository = new HttpBookRepository();
  const memberRepository = new HttpMemberRepository();
  const rentalRepository = new HttpRentalRepository();
  const bestBookRepository = new HttpBestBookRepository();

  return {
    book: {
      registerBook: new RegisterBookUseCase(bookRepository),
      getBooks: new GetBooksUseCase(bookRepository),
      getBook: new GetBookUseCase(bookRepository),
      makeAvailable: new MakeBookAvailableUseCase(bookRepository),
      makeUnavailable: new MakeBookUnavailableUseCase(bookRepository),
    },
    member: {
      registerMember: new RegisterMemberUseCase(memberRepository),
      getMember: new GetMemberUseCase(memberRepository),
      getMemberById: new GetMemberByIdUseCase(memberRepository),
      savePoint: new SavePointUseCase(memberRepository),
      usePoint: new UsePointUseCase(memberRepository),
    },
    rental: {
      createRentalCard: new CreateRentalCardUseCase(rentalRepository),
      getRentalCard: new GetRentalCardUseCase(rentalRepository),
      getRentItems: new GetRentItemsUseCase(rentalRepository),
      getReturnItems: new GetReturnItemsUseCase(rentalRepository),
      rentItem: new RentItemUseCase(rentalRepository),
      returnItem: new ReturnItemUseCase(rentalRepository),
      overdueItem: new OverdueItemUseCase(rentalRepository),
      clearOverdue: new ClearOverdueUseCase(rentalRepository),
    },
    bestbook: {
      getAllBestBooks: new GetAllBestBooksUseCase(bestBookRepository),
      getBestBookById: new GetBestBookByIdUseCase(bestBookRepository),
      recordBestBookRent: new RecordBestBookRentUseCase(bestBookRepository),
    },
    eventFlow: {
      getTopicFlows: new GetTopicFlowsUseCase(),
    },
  };
}
