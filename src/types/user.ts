export type UserRole = "admin" | "seller" | "partner" | "user";

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  referralCode?: string;
}
