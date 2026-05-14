import { describe, expect, it } from "vitest";
import { Point } from "./point";

describe("Point", () => {
  it("rejects negative values", () => {
    expect(Point.of(10).value).toBe(10);
    expect(() => Point.of(-1)).toThrow("포인트는 0 이상이어야 합니다.");
  });
});
