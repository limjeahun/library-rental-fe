import type { Member } from "@domain/member/entities/member";
import { Email } from "@domain/shared/value-objects/email";
import { Point } from "@domain/shared/value-objects/point";
import type { MemberDto } from "../member-dto";

export function toMember(dto: MemberDto): Member {
  return {
    memberNo: dto.memberNo,
    memberId: dto.id,
    name: dto.name,
    email: Email.of(dto.email),
    authorities: dto.authorities,
    point: Point.of(dto.point),
  };
}
