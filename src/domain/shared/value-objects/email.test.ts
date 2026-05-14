import { describe, expect, it } from "vitest";
import { Email } from "./email";

describe("Email", () => {
  it("validates email format", () => {
    expect(Email.of("jenny@example.com").value).toBe("jenny@example.com");
    expect(() => Email.of("jenny")).toThrow("올바른 이메일 형식이 아닙니다.");
  });
});
