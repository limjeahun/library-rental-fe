import type { Point } from "../../shared/value-objects/point";
import type { Email } from "../../shared/value-objects/email";
import type { UserRole } from "../enums/user-role";

export type Member = {
  memberNo: number;
  memberId: string;
  name: string;
  email: Email;
  authorities: UserRole[];
  point: Point;
};
