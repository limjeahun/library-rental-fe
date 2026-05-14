export const bookStatuses = ["ENTERED", "AVAILABLE", "UNAVAILABLE"] as const;

export type BookStatus = (typeof bookStatuses)[number];
