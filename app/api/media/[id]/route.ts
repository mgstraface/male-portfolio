/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Media from "@/models/Media";
import { requireAdmin } from "@/lib/auth";
import { cloudinaryDestroy } from "@/lib/cloudinary-server";
import { z } from "zod";

const UpdateSchema = z.object({
  title: z.string().optional(),

  // ✅ NUEVO
  album: z.string().optional(),

  name: z.string().optional(),
  description: z.string().optional(),
  isFeatured: z.boolean().optional(),
  fullVideoUrl: z.string().optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = await params;

    const body = await req.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Payload inválido", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const update: any = {};

    if (typeof parsed.data.title === "string") update.title = parsed.data.title.trim();

    // ✅ NUEVO: album (vacío => null)
    if (typeof parsed.data.album === "string") {
      const a = parsed.data.album.trim();
      update.album = a ? a : null;
    }

    if (typeof parsed.data.name === "string") update.name = parsed.data.name.trim();
    if (typeof parsed.data.description === "string") update.description = parsed.data.description.trim();
    if (typeof parsed.data.isFeatured === "boolean") update.isFeatured = parsed.data.isFeatured;
    if (typeof parsed.data.fullVideoUrl === "string") update.fullVideoUrl = parsed.data.fullVideoUrl.trim();

    const item = await Media.findByIdAndUpdate(id, update, { new: true })
      .populate("category")
      .lean();

    if (!item) return NextResponse.json({ ok: false, error: "No existe" }, { status: 404 });

    return NextResponse.json({ ok: true, item });
  } catch (e: any) {
    console.error(e);
    const msg = e?.message?.includes("Unauthorized") ? "No autorizado" : "Error actualizando";
    const status = e?.message?.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = await params;

    const item = await Media.findById(id);
    if (!item) return NextResponse.json({ ok: false, error: "No existe" }, { status: 404 });

    // ✅ borrar Cloudinary si tenemos publicId
    if (item.publicId) {
      try {
        await cloudinaryDestroy(item.publicId, item.resourceType === "video" ? "video" : "image");
      } catch (e) {
        console.warn("Cloudinary destroy failed:", e);
      }
    }

    await Media.deleteOne({ _id: id });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    const msg = e?.message?.includes("Unauthorized") ? "No autorizado" : "Error borrando";
    const status = e?.message?.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
