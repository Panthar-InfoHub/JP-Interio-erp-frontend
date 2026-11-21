import { z } from "zod";

/**
 * Public settings, read at build time. NEXT_PUBLIC_* values end up in the browser,
 * so never put a secret here.
 */
const envSchema = z.object({
  /** The API base, including /api (e.g. http://localhost:8080/api). */
  NEXT_PUBLIC_API_URL: z.url(),
});

// Each variable is named in full so Next.js can inline it into the browser bundle.
export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});
