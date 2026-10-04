import { BookOpenText, FileText, FolderKanban, Inbox, Info } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { requirePagePermission } from "@/lib/auth/dal";
import { countSeededUnits, getDashboardCounts } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const admin = await requirePagePermission("dashboard:view");
  const [counts, seeded] = await Promise.all([getDashboardCounts(), countSeededUnits()]);
  const firstName = admin.name.split(" ")[0];

  return (
    <>
      <PageHeader title={`Hello, ${firstName}`} description="Here's what's on your website." />
      {seeded > 0 && (
        <div role="note" className="mb-8 flex gap-3 rounded-md border border-line bg-surface p-4 text-small text-fg-secondary">
          <Info className="mt-0.5 size-4 shrink-0 text-fg-muted" aria-hidden />
          <p>
            This site includes <strong className="font-medium text-fg">demo content</strong> from the development seed
            (a fictional marketer, sample results and copy). Edit or replace it in{" "}
            <Link href="/admin/settings" className="underline underline-offset-4 hover:text-fg">Settings</Link>,{" "}
            <Link href="/admin/navigation" className="underline underline-offset-4 hover:text-fg">Navigation</Link> and{" "}
            <Link href="/admin/pages" className="underline underline-offset-4 hover:text-fg">Pages</Link> before launch.
          </p>
        </div>
      )}
      <section aria-label="Content overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Projects" value={counts.projects} icon={FolderKanban} href="/admin/projects" emptyText="No projects yet" />
        <StatCard label="Case studies" value={counts.caseStudies} icon={FileText} href="/admin/case-studies" emptyText="No case studies yet" />
        <StatCard label="Blog posts" value={counts.blogPosts} icon={BookOpenText} href="/admin/blog" emptyText="No posts yet" />
        <StatCard label="Messages" value={counts.messages} icon={Inbox} href="/admin/messages" emptyText="No messages yet" />
      </section>
    </>
  );
}
