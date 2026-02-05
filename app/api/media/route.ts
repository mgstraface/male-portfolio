import { NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import Media from "@/models/Media";
import { requireAdmin } from "@/lib/auth";

type MediaBody = {
  title?: string;
  type?: "photo" | "video";
  category?: string;
  url?: string;
  thumbnail?: string;
  isFeatured?: boolean;
};

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const filter: Record<string, unknown> = {};
    if (type === "photo" || type === "video") filter.type = type;
    if (category && Types.ObjectId.isValid(category)) filter.category = category;
    if (featured === "true") filter.isFeatured = true;

    const items = await Media.find(filter)
      .populate("category")
      .sort({ createdAt: -1 });

    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    await dbConnect();

    const body = (await req.json()) as MediaBody;

    const type = body.type;
    const category = body.category;
    const url = (body.url || "").trim();

    if ((type !== "photo" && type !== "video") || !category || !url) {
      return NextResponse.json(
        { ok: false, error: "type, category y url son obligatorios" },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(category)) {
      return NextResponse.json({ ok: false, error: "category inválida" }, { status: 400 });
    }

    const created = await Media.create({
      title: body.title?.trim() || "",
      type,
      category,
      url,
      thumbnail: body.thumbnail?.trim() || undefined,
      isFeatured: Boolean(body.isFeatured),
    });

    return NextResponse.json({ ok: true, item: created }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
