/* eslint-disable @typescript-eslint/no-explicit-any */
/* app/api/media/projects/album/route.ts */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Media from "@/models/Media";
import Category from "@/models/Category";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const album = (searchParams.get("album") || "").trim();

    if (!album) {
      return NextResponse.json({ ok: false, error: "Falta album" }, { status: 400 });
    }

    // buscamos la categoría Projects (por nombre) para no mezclar con otras categorías
    const projectsCat = await Category.findOne({
      active: true,
      name: { $regex: /^projects?$/i },
    }).lean();

    const q: any = { album };
    if (projectsCat?._id) q.category = projectsCat._id;

    const items = await Media.find(q)
      .select("type url thumbnail fullVideoUrl createdAt album name description title")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ ok: true, items });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Error listando album" }, { status: 500 });
  }
}
