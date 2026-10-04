import { NextResponse, type NextRequest } from "next/server";
import { apiError } from "@/lib/api";
import { authorize } from "@/lib/auth/dal";
import { ValidationError } from "@/lib/errors";
import { listMedia, uploadMedia } from "@/lib/media/service";

/** Lists media for pickers. `?before=<id>` pages backwards. */
export async function GET(request: NextRequest) {
  try {
    await authorize("media:manage");
    const before = request.nextUrl.searchParams.get("before") ?? undefined;
    return NextResponse.json({ ok: true, data: await listMedia({ before }) });
  } catch (error) {
    return apiError(error);
  }
}

/** Uploads one file (multipart field "file"). */
export async function POST(request: NextRequest) {
  try {
    const admin = await authorize("media:manage");
    const form = await request.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) {
      throw new ValidationError({ file: ["Choose a file to upload."] });
    }
    const item = await uploadMedia(file, admin.id);
    return NextResponse.json({ ok: true, data: item }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
