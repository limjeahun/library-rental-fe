export const rentStatuses = ["RENT_AVAILABLE", "RENT_UNAVAILABLE"] as const;

export type RentStatus = (typeof rentStatuses)[number];
