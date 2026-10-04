import type { Metadata } from "next";
import { MediaLibrary } from "@/components/admin/media/media-library";
import { PageHeader } from "@/components/admin/page-header";
import { requirePagePermission } from "@/lib/auth/dal";
import { env } from "@/lib/env";
import { listMedia } from "@/lib/media/service";

export const metadata: Metadata = { title: "Media" };

export default async function MediaPage() {
  await requirePagePermission("media:manage");
  const items = await listMedia();
  return (
    <>
      <PageHeader title="Media" description="Images you can use anywhere on the website." />
      <MediaLibrary items={items} maxUploadMb={env().MEDIA_MAX_UPLOAD_MB} />
    </>
  );
}
