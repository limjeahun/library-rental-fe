import type { Member } from "../../entities/member";

export type RegisterMemberCommand = {
  id: string;
  name: string;
  passWord: string;
  email: string;
};

export type ChangePointCommand = {
  memberId: string;
  point: number;
};

export interface MemberRepositoryPort {
  register(command: RegisterMemberCommand): Promise<Member>;
  findByNo(memberNo: number): Promise<Member>;
  findById(memberId: string): Promise<Member>;
  savePoint(command: ChangePointCommand): Promise<Member>;
  usePoint(command: ChangePointCommand): Promise<Member>;
}
