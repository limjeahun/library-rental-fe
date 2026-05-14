export const userRoles = ["ADMIN", "USER"] as const;

export type UserRole = (typeof userRoles)[number];
