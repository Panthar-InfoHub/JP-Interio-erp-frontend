import { apiClient } from "@/lib/api/client";
import { getPage, type ListQuery } from "@/lib/api/paged";
import type { ApiSuccess, PageMeta } from "@/types/api-response";
import type { components, operations } from "@/types/api/tasks";

type Schemas = components["schemas"];

/** One row of a task list (no description or photos; `photoCount` instead). */
export type TaskRow = Schemas["TaskRow"];
/** One task in full: description, photos, completion note, cancel reason. */
export type Task = Schemas["Task"];
export type TaskStatus = Schemas["TaskStatus"];
export type TaskPriority = Schemas["TaskPriority"];
/** A doer, giver, canceller or flagged-to person (null when not set). */
export type TaskPerson = Schemas["Person"];
export type TaskCreate = Schemas["TaskCreate"];
/** Send only what changes; `description: null` clears it (DEC-262: wrap in Partial). */
export type TaskUpdate = Partial<Schemas["TaskUpdate"]>;

export type TaskComplete = Schemas["TaskComplete"];

type MineData = NonNullable<
  operations["listMyTasks"]["responses"][200]["content"]["application/json"]["data"]
>;
/** The "My tasks" views (DEC-182, DEC-293). */
export type MyTaskView = NonNullable<
  NonNullable<operations["listMyTasks"]["parameters"]["query"]>["view"]
>;
/** A count for every view (they ignore paging). */
export type MyTaskCounts = MineData["counts"];

const base = (id: string) => `/tasks/${encodeURIComponent(id)}`;

/**
 * Field tasks (docs/api/tasks.openapi.yaml 0.2.0, Module 12). Out of scope → 404.
 */
export const tasksApi = {
  /**
   * `GET /tasks` (`tasks.view`): tasks in my scope, newest given first by default. Filters
   * status (one, or `unfinished`), priority, category, assignedToId, assignedById, zoneId,
   * dueFrom / dueTo (plain days), overdue, escalatedToMe, search; sort createdAt / dueDate /
   * completedAt.
   */
  list: (query: ListQuery) => getPage<TaskRow>("/tasks", { ...query }),

  /** `GET /tasks/categories` (`tasks.assign`): the suggested categories. */
  categories: async () =>
    (await apiClient.get<ApiSuccess<string[]>>("/tasks/categories")).data.data,

  /** `GET /tasks/{id}`: everything, within my `tasks.view` scope or given to me (else 404). */
  get: async (id: string) => (await apiClient.get<ApiSuccess<Task>>(base(id))).data.data,

  /**
   * `POST /tasks` (`tasks.assign`). Not retry-safe (DEC-180): call once per tap. 403 wrong
   * role, 404 outside my reach, 409 the person isn't active.
   */
  create: async (input: TaskCreate) =>
    (await apiClient.post<ApiSuccess<{ task: Task }>>("/tasks", input)).data,

  /** `PATCH /tasks/{id}`: giver or above; `changed: false` when nothing differs. */
  update: async (id: string, changes: TaskUpdate) =>
    (await apiClient.patch<ApiSuccess<{ changed: boolean; task: Task }>>(base(id), changes)).data,

  /** `POST /tasks/{id}/cancel`: giver or above, reason 10 – 500. Already cancelled → `alreadyDone`. */
  cancel: async (id: string, reason: string) =>
    (
      await apiClient.post<ApiSuccess<{ alreadyDone: boolean; task: Task }>>(`${base(id)}/cancel`, {
        reason,
      })
    ).data,

  /**
   * `GET /tasks/mine` (`tasks.complete`): tasks given to me in one view (fixed order per
   * view, no sort / search), plus a count for every view.
   */
  mine: async (query: { view: MyTaskView; page: number; limit: number }) => {
    const response = await apiClient.get<ApiSuccess<MineData>>("/tasks/mine", { params: query });
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

  /** `POST /tasks/{id}/start`: only the doer; open → in progress. Again → `alreadyDone`. */
  start: async (id: string) =>
    (await apiClient.post<ApiSuccess<{ alreadyDone: boolean; task: Task }>>(`${base(id)}/start`))
      .data,

  /**
   * `POST /tasks/{id}/complete`: only the doer; 1 – 10 uploaded `task_photo` links and an
   * optional note. Then locked. Again → `alreadyDone`.
   */
  complete: async (id: string, input: TaskComplete) =>
    (
      await apiClient.post<ApiSuccess<{ alreadyDone: boolean; task: Task }>>(
        `${base(id)}/complete`,
        input,
      )
    ).data,
};
