import { apiClient } from "@/lib/api/client";
import type { ApiSuccess } from "@/types/api-response";
import type { AsmRanking, Dashboard, DashboardPeriodKey } from "@/types/dashboard";

/** `GET /dashboard`: one address; the server picks the cards for who is asking (DEC-220). */
export const dashboardApi = {
  get: async (params: { period: DashboardPeriodKey; rankAsmsBy: AsmRanking }) =>
    (await apiClient.get<ApiSuccess<Dashboard>>("/dashboard", { params })).data.data,
};
