import type { ReactNode } from "react";

import { AuthGate } from "@/components/auth/AuthGate";
import { ConsoleFrame } from "@/components/layout/ConsoleFrame";

// Every page inside the panel needs a session (AuthGate) and shares the frame.
export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <ConsoleFrame>{children}</ConsoleFrame>
    </AuthGate>
  );
}
