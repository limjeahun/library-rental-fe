export class Email {
  private constructor(readonly value: string) {}

  static of(value: string): Email {
    const normalized = value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new Error("올바른 이메일 형식이 아닙니다.");
    }
    return new Email(normalized);
  }
}
