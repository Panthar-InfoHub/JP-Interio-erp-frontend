"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useCan } from "@/hooks/auth/usePermission";
import {
  tasksApi,
  type MyTaskView,
  type TaskComplete,
  type TaskCreate,
  type TaskUpdate,
} from "@/lib/api/tasks.api";
import { queryKeys } from "@/lib/query/queryKeys";

/** One page of the team task list; the previous page stays on screen while the next loads. */
export function useTaskList(query: Record<string, string | number>) {
  return useQuery({
    queryKey: queryKeys.tasks.list(query),
    queryFn: () => tasksApi.list(query),
    placeholderData: keepPreviousData,
  });
}

/** One task in full (details page, edit pop-up). */
export function useTask(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => tasksApi.get(id),
    enabled,
  });
}

/** The suggested categories (a fixed list on the server); only for people who give tasks. */
export function useTaskCategories() {
  const can = useCan();
  return useQuery({
    queryKey: queryKeys.tasks.categories,
    queryFn: tasksApi.categories,
    enabled: can("tasks.assign"),
    staleTime: Infinity,
  });
}

/**
 * Give, edit, cancel, start, complete. Afterwards refresh every task list / task, and the
 * staff data (staff details show task counts, DEC-184). The refresh is not waited for: a
 * row whose task moves to another view disappears with it, and the caller's own
 * "done" message (its `mutate` callbacks) must still run first.
 */
export function useTaskActions() {
  const queryClient = useQueryClient();
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
  };

  return {
    create: useMutation({
      mutationFn: (input: TaskCreate) => tasksApi.create(input),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ id, changes }: { id: string; changes: TaskUpdate }) =>
        tasksApi.update(id, changes),
      onSuccess: refresh,
    }),
    cancel: useMutation({
      mutationFn: ({ id, reason }: { id: string; reason: string }) => tasksApi.cancel(id, reason),
      onSuccess: refresh,
    }),
    start: useMutation({
      mutationFn: (id: string) => tasksApi.start(id),
      onSuccess: refresh,
    }),
    complete: useMutation({
      mutationFn: ({ id, input }: { id: string; input: TaskComplete }) =>
        tasksApi.complete(id, input),
      onSuccess: refresh,
    }),
  };
}

/** One "My tasks" view and every view's count; the previous page stays while the next loads. */
export function useMyTasks(query: { view: MyTaskView; page: number; limit: number }) {
  return useQuery({
    queryKey: queryKeys.tasks.mine(query),
    queryFn: () => tasksApi.mine(query),
    placeholderData: keepPreviousData,
  });
}
