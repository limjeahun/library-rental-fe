import type { Member } from "@domain/member/entities/member";
import type {
  ChangePointCommand,
  MemberRepositoryPort,
  RegisterMemberCommand,
} from "@domain/member/ports/driven/member-repository";
import { apiRequest } from "../http/fetch-client";
import type { MemberDto } from "./member-dto";
import { toMember } from "./mappers/member-mapper";

export class HttpMemberRepository implements MemberRepositoryPort {
  async register(command: RegisterMemberCommand): Promise<Member> {
    return toMember(await apiRequest<MemberDto>("/api/member/Member/", { method: "POST", body: command }));
  }

  async findByNo(memberNo: number): Promise<Member> {
    return toMember(await apiRequest<MemberDto>(`/api/member/Member/${memberNo}`));
  }

  async findById(memberId: string): Promise<Member> {
    return toMember(await apiRequest<MemberDto>(`/api/member/Member/by-id/${memberId}`));
  }

  async savePoint(command: ChangePointCommand): Promise<Member> {
    return toMember(
      await apiRequest<MemberDto>(`/api/member/Member/${command.memberId}/points/save`, {
        method: "POST",
        body: { point: command.point },
      }),
    );
  }

  async usePoint(command: ChangePointCommand): Promise<Member> {
    return toMember(
      await apiRequest<MemberDto>(`/api/member/Member/${command.memberId}/points/use`, {
        method: "POST",
        body: { point: command.point },
      }),
    );
  }
}
