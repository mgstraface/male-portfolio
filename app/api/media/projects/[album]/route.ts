/* eslint-disable @typescript-eslint/no-explicit-any */
/* app/api/media/projects/[album]/route.ts */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Media from "@/models/Media";
import Category from "@/models/Category";

export async function GET(_req: Request, ctx: { params: Promise<{ album: string }> }) {
  try {
    await dbConnect();
    const { album } = await ctx.params;
    const decodedAlbum = decodeURIComponent(album || "").trim();

    if (!decodedAlbum) {
      return NextResponse.json({ ok: false, error: "Album inválido" }, { status: 400 });
    }

    const cats = await Category.find({
      name: { $in: ["Projects", "projects", "Project", "project"] },
      active: true,
    })
      .select("_id")
      .lean();

    const catIds = cats.map((c: any) => c._id);
    if (catIds.length === 0) return NextResponse.json({ ok: true, album: decodedAlbum, items: [] });

    const items = await Media.find({
      category: { $in: catIds },
      album: decodedAlbum,
    })
      .sort({ createdAt: -1 })
      .select("_id type url thumbnail fullVideoUrl name description album title")
      .lean();

    return NextResponse.json({ ok: true, album: decodedAlbum, items });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Error cargando álbum" }, { status: 500 });
  }
}
