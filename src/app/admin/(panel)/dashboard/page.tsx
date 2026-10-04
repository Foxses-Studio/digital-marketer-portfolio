import { BookOpenText, FileText, FolderKanban, Inbox } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { requirePagePermission } from "@/lib/auth/dal";
import { getDashboardCounts } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const admin = await requirePagePermission("dashboard:view");
  const counts = await getDashboardCounts();
  const firstName = admin.name.split(" ")[0];

  return (
    <>
      <PageHeader title={`Hello, ${firstName}`} description="Here's what's on your website." />
      <section aria-label="Content overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Projects" value={counts.projects} icon={FolderKanban} href="/admin/projects" emptyText="No projects yet" />
        <StatCard label="Case studies" value={counts.caseStudies} icon={FileText} href="/admin/case-studies" emptyText="No case studies yet" />
        <StatCard label="Blog posts" value={counts.blogPosts} icon={BookOpenText} href="/admin/blog" emptyText="No posts yet" />
        <StatCard label="Messages" value={counts.messages} icon={Inbox} href="/admin/messages" emptyText="No messages yet" />
      </section>
    </>
  );
}
