import type { UserRole } from "@domain/member/enums/user-role";

export type MemberDto = {
  memberNo: number;
  id: string;
  name: string;
  email: string;
  authorities: UserRole[];
  point: number;
};
