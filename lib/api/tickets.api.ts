import { apiClient } from "@/lib/api/client";
import type { ListQuery } from "@/lib/api/paged";
import type { ApiSuccess, PageMeta } from "@/types/api-response";
import type { components, operations } from "@/types/api/tickets";

type Schemas = components["schemas"];

type QueueData = NonNullable<
  operations["ticketQueue"]["responses"][200]["content"]["application/json"]["data"]
>;

/** One queue row (no description or photo links; `photoCount` instead). */
export type TicketRow = Schemas["AdminTicketRow"];
/** One ticket in full for the Admin: description, photos, partner, who last changed it. */
export type Ticket = Schemas["AdminTicket"];
export type TicketStatus = Schemas["TicketStatus"];
export type TicketCategory = Schemas["TicketCategory"];
/** The queue's `status`: one status, `unfinished` (default) or `all`. */
export type TicketQueueView = NonNullable<
  NonNullable<operations["ticketQueue"]["parameters"]["query"]>["status"]
>;
export type TicketStatusChange = Schemas["TicketStatusChange"];
/** One ticket's partner (phone, type, zone, KYC state, account status). */
export type TicketPartner = Schemas["TicketPartner"];
/** Counts per status over every ticket (not affected by the filters). */
export type TicketCounts = QueueData["counts"];

/**
 * Support tickets, the Admin side (docs/api/tickets.openapi.yaml 0.2.0, Module 15). Only the
 * Admin (`tickets.handle`, web console).
 */
export const ticketsApi = {
  /**
   * `GET /tickets`: newest first; `status` unfinished (default) / all / one status;
   * `category`; `search` (ticket no., partner name or phone); `partnerId`. Plus counts.
   */
  queue: async (query: ListQuery) => {
    const params = Object.fromEntries(
      Object.entries(query).filter(
        ([, value]) => value !== null && value !== undefined && value !== "",
      ),
    );
    const response = await apiClient.get<ApiSuccess<QueueData>>("/tickets", { params });
    const data = response.data.data;
    const meta = (response.data.meta ?? {}) as Partial<PageMeta>;
    return {
      counts: data.counts,
      items: data.items,
      meta: {
        page: meta.page ?? 1,
        limit: meta.limit ?? data.items.length,
        total: meta.total ?? data.items.length,
        totalPages: meta.totalPages ?? 1,
      },
    };
  },

  /** `GET /tickets/{id}`: the ticket in full (unknown → 404). */
  get: async (id: string) =>
    (await apiClient.get<ApiSuccess<Ticket>>(`/tickets/${encodeURIComponent(id)}`)).data.data,

  /**
   * `POST /tickets/{id}/status`: in_progress (no note) / resolved / rejected (note 10 –
   * 2,000, the partner sees it). Final tickets → 409; the same status again → `alreadyDone`.
   */
  changeStatus: async (id: string, input: TicketStatusChange) =>
    (
      await apiClient.post<ApiSuccess<{ alreadyDone: boolean; ticket: Ticket }>>(
        `/tickets/${encodeURIComponent(id)}/status`,
        input,
      )
    ).data,

  /** `GET /tickets/categories` (DEC-295): the 6 codes and their names. */
  categories: async () =>
    (
      await apiClient.get<ApiSuccess<{ code: TicketCategory; label: string }[]>>(
        "/tickets/categories",
      )
    ).data.data,
};
