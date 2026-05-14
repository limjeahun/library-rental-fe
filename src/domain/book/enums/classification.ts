export const classifications = ["ARTS", "COMPUTER", "LITERATURE"] as const;

export type Classification = (typeof classifications)[number];
