/**
 * Staff (docs/api/users.openapi.yaml), checked against the backend's real reply
 * (user.service.ts `getUser`, `countTeam`).
 */
import type { Staff, SubAdminArea } from "@/types/auth";

export type { Staff };
export type StaffRole = Staff["role"]["key"];
export type StaffStatus = Staff["status"];
/** The roles anyone can add (never an Admin). */
export type NewStaffRole = Exclude<StaffRole, "admin">;

/** `POST /users`. Extra field by role: areas (sub_admin), zoneId (zonal_head, asm), asmId (SE). */
export interface StaffCreateInput {
  role: NewStaffRole;
  name: string;
  phone: string;
  email?: string;
  areas?: SubAdminArea[];
  zoneId?: string | null;
  asmId?: string;
}

/** `PATCH /users/:id`: send only what changes; `email: null` clears it. */
export interface StaffChanges {
  name?: string;
  phone?: string;
  email?: string | null;
}

/**
 * Active and suspended people under them. Zonal Head: asms, salesExecutives, partners in
 * the zone; ASM: salesExecutives, partners they own; Sales Executive: partners assigned to
 * them. Partner counts include sign-ups not yet verified. Null for Admin and Sub-Admins.
 */
export interface StaffTeamCounts {
  asms?: number;
  salesExecutives?: number;
  partners?: number;
}

/** Unfinished tasks (DEC-184): given to them, of those overdue, and given by them. */
export interface StaffTaskCounts {
  pending: number;
  overdue: number;
  givenOpen: number;
}

/** `GET /users/:id`. */
export interface StaffDetail extends Staff {
  counts: StaffTeamCounts | null;
  tasks?: StaffTaskCounts;
}
