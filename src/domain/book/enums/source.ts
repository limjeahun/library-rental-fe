export const sources = ["DONATION", "SUPPLY"] as const;

export type Source = (typeof sources)[number];
