import { describe, expect, it } from "vitest";
import { toMember } from "./member-mapper";

describe("member mapper", () => {
  it("maps API DTO to domain member", () => {
    const member = toMember({
      memberNo: 1,
      id: "jenny",
      name: "제니",
      email: "jenny@example.com",
      authorities: ["USER"],
      point: 20,
    });

    expect(member.memberId).toBe("jenny");
    expect(member.email.value).toBe("jenny@example.com");
    expect(member.point.value).toBe(20);
  });
});
