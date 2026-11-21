"use client";

import { useMutation } from "@tanstack/react-query";

import { authApi } from "@/lib/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";

/** Edit my own name / email (`PATCH /users/me`); the header updates straight away. */
export function useUpdateMe() {
  return useMutation({
    mutationFn: authApi.updateMe,
    onSuccess: ({ data }) => {
      const { user, setUser } = useAuthStore.getState();
      if (user) setUser({ ...user, name: data.name, email: data.email });
    },
  });
}
