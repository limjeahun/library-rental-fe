export class Point {
  private constructor(readonly value: number) {}

  static of(value: number): Point {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error("포인트는 0 이상이어야 합니다.");
    }
    return new Point(value);
  }
}
