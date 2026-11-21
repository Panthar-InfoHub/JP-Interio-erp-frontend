"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createQueryClient } from "@/lib/query/queryClient";

/** Everything the whole app needs on the browser side (data cache, toasts). */
export function AppProviders({ children }: { children: ReactNode }) {
  // One cache per browser tab, created once (not on every render).
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster position="top-right" richColors closeButton />
      {/*
        The devtools package renders nothing in production builds by itself, so a plain
        import is enough. (next/dynamic with ssr:false here broke Next's instant-navigation
        check in development, DEC-232.)
      */}
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
