/* eslint-disable @typescript-eslint/no-explicit-any */
/* app/api/media/projects/[album]/delete/route.ts */
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Media from "@/models/Media";
import Category from "@/models/Category";
import { requireAdmin } from "@/lib/auth";
import { cloudinaryDestroy } from "@/lib/cloudinary-server";

type Ctx = { params: Promise<{ album: string }> };

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
    await dbConnect();

    const { album } = await params;
    const decodedAlbum = decodeURIComponent(album || "").trim();

    if (!decodedAlbum) {
      return NextResponse.json({ ok: false, error: "Album inválido" }, { status: 400 });
    }

    // solo Projects
    const cats = await Category.find({
      name: { $in: ["Projects", "projects", "Project", "project"] },
      active: true,
    })
      .select("_id")
      .lean();

    const catIds = cats.map((c: any) => c._id);
    if (catIds.length === 0) {
      return NextResponse.json({ ok: true, deleted: 0, cloudinaryDeleted: 0 });
    }

    // traemos items para borrar cloudinary
    const items = await Media.find({
      category: { $in: catIds },
      album: decodedAlbum,
    }).select("_id publicId resourceType");

    if (!items.length) {
      return NextResponse.json({ ok: true, deleted: 0, cloudinaryDeleted: 0 });
    }

    // borrar en cloudinary (best-effort)
    let cloudinaryDeleted = 0;
    for (const it of items) {
      if (!it.publicId) continue;
      try {
        await cloudinaryDestroy(it.publicId, it.resourceType === "video" ? "video" : "image");
        cloudinaryDeleted += 1;
      } catch (e) {
        console.warn("Cloudinary destroy failed:", it.publicId, e);
      }
    }

    const delRes = await Media.deleteMany({
      category: { $in: catIds },
      album: decodedAlbum,
    });

    return NextResponse.json({
      ok: true,
      deleted: delRes.deletedCount || 0,
      cloudinaryDeleted,
      album: decodedAlbum,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error borrando álbum" }, { status: 500 });
  }
}
