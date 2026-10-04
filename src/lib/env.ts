import "server-only";
import { z } from "zod";

/**
 * Server environment, validated once. Server-only: never import this from
 * client code, and never prefix secrets with NEXT_PUBLIC_.
 */
const envSchema = z.object({
  MONGODB_URI: z
    .string()
    .regex(/^mongodb(\+srv)?:\/\//, "MONGODB_URI must be a MongoDB connection string"),
  /** Database name inside the cluster. */
  MONGODB_DB: z.string().min(1).default("portfolio"),

  /** Where uploaded media is stored. Only "local" is implemented so far. */
  MEDIA_STORAGE_DRIVER: z.enum(["local"]).default("local"),
  /** Directory for the local driver, relative to the project root. */
  MEDIA_LOCAL_DIR: z.string().min(1).default("storage/uploads"),
  MEDIA_MAX_UPLOAD_MB: z.coerce.number().positive().max(100).default(10),

  NEXT_PUBLIC_SITE_URL: z.url().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/** Validated server environment. Throws a readable error on misconfiguration. */
export function env(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid environment variables:\n${z.prettifyError(parsed.error)}`,
    );
  }
  cached = parsed.data;
  return cached;
}
