import type { components as AuthSchemas } from "@/types/api/auth";
import type { components as UserSchemas } from "@/types/api/users";

type Auth = AuthSchemas["schemas"];

/** The logged-in person (`GET /auth/me`). */
export type Me = Auth["Me"];

/** My actions and their scopes (`GET /auth/me/permissions`). */
export type MyPermissions = Auth["MyPermissions"];

/** `full` = all records, `scoped` = my zone, `own` = my own / assigned records. */
export type PermissionScope = MyPermissions["permissions"][string];

export type RoleKey = MyPermissions["role"];
export type SubAdminArea = MyPermissions["subAdminAreas"][number];

/** One logged-in device (`GET /auth/sessions`). */
export type SessionItem = Auth["SessionItem"];

export type RequestOtpResult = Auth["RequestOtpResult"];

/** Login / refresh reply for the web console: the refresh token is in a cookie, not here. */
export type WebLoginResult = Omit<Auth["LoginResult"], "refreshToken">;

/** A staff profile (`PATCH /users/me` reply). */
export type Staff = UserSchemas["schemas"]["Staff"];
