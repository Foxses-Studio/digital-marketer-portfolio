import "server-only";
import { getDb } from "@/db";

/**
 * Real counts for the dashboard. Collections for modules that aren't built
 * yet simply don't exist, so they count as zero, which is accurate.
 * Collection names here must match the ones the modules will use.
 */
const COUNTED = {
  projects: "projects",
  caseStudies: "caseStudies",
  blogPosts: "blogPosts",
  messages: "messages",
} as const;

export type DashboardCounts = Record<keyof typeof COUNTED, number>;

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const db = await getDb();
  const entries = await Promise.all(
    Object.entries(COUNTED).map(async ([key, name]) => [
      key,
      await db.collection(name).countDocuments(),
    ]),
  );
  return Object.fromEntries(entries) as DashboardCounts;
}
