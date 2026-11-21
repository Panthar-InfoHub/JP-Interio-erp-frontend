import { apiClient } from "@/lib/api/client";
import type { ApiSuccess } from "@/types/api-response";
import type {
  Me,
  MyPermissions,
  RequestOtpResult,
  SessionItem,
  Staff,
  WebLoginResult,
} from "@/types/auth";

/** Login steps never trigger a token refresh. */
const loginStep = { skipAuthRefresh: true } as const;

/** Auth and "my account" endpoints (docs/api/auth.openapi.yaml, users.openapi.yaml). */
export const authApi = {
  requestOtp: async (phone: string) =>
    (
      await apiClient.post<ApiSuccess<RequestOtpResult>>(
        "/auth/otp/request",
        { phone, app: "web" },
        loginStep,
      )
    ).data.data,

  verifyOtp: async (phone: string, otp: string) =>
    (
      await apiClient.post<ApiSuccess<WebLoginResult>>(
        "/auth/otp/verify",
        { phone, otp, app: "web" },
        loginStep,
      )
    ).data.data,

  getMe: async () => (await apiClient.get<ApiSuccess<Me>>("/auth/me")).data.data,

  getMyPermissions: async () =>
    (await apiClient.get<ApiSuccess<MyPermissions>>("/auth/me/permissions")).data.data,

  listSessions: async () =>
    (await apiClient.get<ApiSuccess<SessionItem[]>>("/auth/sessions")).data.data,

  revokeSession: async (id: string) => {
    await apiClient.delete(`/auth/sessions/${encodeURIComponent(id)}`);
  },

  logout: async () => {
    await apiClient.post("/auth/logout");
  },

  logoutAll: async () =>
    (await apiClient.post<ApiSuccess<{ sessionsEnded: number }>>("/auth/logout-all")).data.data,

  updateMe: async (body: { name?: string; email?: string | null }) =>
    (await apiClient.patch<ApiSuccess<Staff>>("/users/me", body)).data,
};
