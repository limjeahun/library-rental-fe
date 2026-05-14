export const locations = ["JEONGJA", "PANGYO"] as const;

export type Location = (typeof locations)[number];
