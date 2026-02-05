import { NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import Media from "@/models/Media";
import { requireAdmin } from "@/lib/auth";

type MediaUpdateBody = {
  title?: string;
  type?: "photo" | "video";
  category?: string;
  url?: string;
  thumbnail?: string;
  isFeatured?: boolean;
};

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
    }

    const item = await Media.findById(params.id).populate("category");
    if (!item) return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });

    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    await dbConnect();

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
    }

    const body = (await req.json()) as MediaUpdateBody;

    const update: Record<string, unknown> = {};
    if (typeof body.title === "string") update.title = body.title.trim();
    if (body.type === "photo" || body.type === "video") update.type = body.type;
    if (typeof body.url === "string") update.url = body.url.trim();
    if (typeof body.thumbnail === "string") update.thumbnail = body.thumbnail.trim();
    if (typeof body.isFeatured === "boolean") update.isFeatured = body.isFeatured;

    if (typeof body.category === "string") {
      if (!Types.ObjectId.isValid(body.category)) {
        return NextResponse.json({ ok: false, error: "category inválida" }, { status: 400 });
      }
      update.category = body.category;
    }

    const updated = await Media.findByIdAndUpdate(params.id, update, { new: true }).populate(
      "category"
    );

    if (!updated) return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });

    return NextResponse.json({ ok: true, item: updated });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    await dbConnect();

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
    }

    const deleted = await Media.findByIdAndDelete(params.id);
    if (!deleted) return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
