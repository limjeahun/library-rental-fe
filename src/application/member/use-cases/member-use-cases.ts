import type { Member } from "@domain/member/entities/member";
import type {
  ChangePointCommand,
  MemberRepositoryPort,
  RegisterMemberCommand,
} from "@domain/member/ports/driven/member-repository";

export class RegisterMemberUseCase {
  constructor(private readonly repository: MemberRepositoryPort) {}

  execute(command: RegisterMemberCommand): Promise<Member> {
    return this.repository.register(command);
  }
}

export class GetMemberUseCase {
  constructor(private readonly repository: MemberRepositoryPort) {}

  execute(memberNo: number): Promise<Member> {
    return this.repository.findByNo(memberNo);
  }
}

export class GetMemberByIdUseCase {
  constructor(private readonly repository: MemberRepositoryPort) {}

  execute(memberId: string): Promise<Member> {
    return this.repository.findById(memberId);
  }
}

export class SavePointUseCase {
  constructor(private readonly repository: MemberRepositoryPort) {}

  execute(command: ChangePointCommand): Promise<Member> {
    return this.repository.savePoint(command);
  }
}

export class UsePointUseCase {
  constructor(private readonly repository: MemberRepositoryPort) {}

  execute(command: ChangePointCommand): Promise<Member> {
    return this.repository.usePoint(command);
  }
}
