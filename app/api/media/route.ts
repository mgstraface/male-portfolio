import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Media from "@/models/Media";

export async function GET() {
  try {

    await dbConnect();

    const items = await Media.find().populate("category").sort({ createdAt: -1 });
    return NextResponse.json({ ok: true, items });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    await dbConnect();

    const body = (await req.json()) as {
      title?: string;
      type?: "photo" | "video";
      category?: string;
      url?: string;
      thumbnail?: string;
      isFeatured?: boolean;
      publicId?: string;
      resourceType?: "image" | "video";
      fullVideoUrl?: string;
    };

    const type = body.type;
    const category = body.category;
    const url = typeof body.url === "string" ? body.url.trim() : "";

    if (type !== "photo" && type !== "video") {
      return NextResponse.json({ ok: false, error: "type inválido" }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ ok: false, error: "category requerida" }, { status: 400 });
    }
    if (!url) {
      return NextResponse.json({ ok: false, error: "url requerida" }, { status: 400 });
    }

    const publicId = typeof body.publicId === "string" ? body.publicId.trim() : "";
    const resourceType =
      body.resourceType === "image" || body.resourceType === "video"
        ? body.resourceType
        : undefined;

    const fullVideoUrl = typeof body.fullVideoUrl === "string" ? body.fullVideoUrl.trim() : "";
    if (type === "video" && fullVideoUrl && !/^https?:\/\//i.test(fullVideoUrl)) {
      return NextResponse.json({ ok: false, error: "fullVideoUrl inválida" }, { status: 400 });
    }

    const item = await Media.create({
      title: typeof body.title === "string" ? body.title.trim() : "",
      type,
      category,
      url,
      thumbnail: typeof body.thumbnail === "string" ? body.thumbnail.trim() : "",
      isFeatured: !!body.isFeatured,

      publicId: publicId || undefined,
      resourceType,

      fullVideoUrl: type === "video" ? (fullVideoUrl || undefined) : undefined,
    });

    const populated = await Media.findById(item._id).populate("category");
    return NextResponse.json({ ok: true, item: populated }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
