export type UserRole = "EXHIBITOR" | "BUYER";

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
}
