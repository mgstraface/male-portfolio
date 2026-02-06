/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import dbConnect from '@/lib/db';
import Media from "@/models/Media";
import { requireAdmin } from "@/lib/auth";
import { cloudinaryDestroy } from "@/lib/cloudinary-server"; // tu helper server-side

import { z } from "zod";

const UpdateSchema = z.object({
  title: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  isFeatured: z.boolean().optional(),
  fullVideoUrl: z.string().optional(),
});

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> } // ✅ Next 16 “params Promise”
) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = await ctx.params;

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
    if (typeof parsed.data.name === "string") update.name = parsed.data.name.trim();
    if (typeof parsed.data.description === "string") update.description = parsed.data.description.trim();
    if (typeof parsed.data.isFeatured === "boolean") update.isFeatured = parsed.data.isFeatured;
    if (typeof parsed.data.fullVideoUrl === "string") update.fullVideoUrl = parsed.data.fullVideoUrl.trim();

    const item = await Media.findByIdAndUpdate(id, update, { new: true }).populate("category").lean();
    if (!item) return NextResponse.json({ ok: false, error: "No existe" }, { status: 404 });

    return NextResponse.json({ ok: true, item });
  } catch (e: any) {
    console.error(e);
    const msg = e?.message?.includes("Unauthorized") ? "No autorizado" : "Error actualizando";
    const status = e?.message?.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = await ctx.params;

    const item = await Media.findById(id);
    if (!item) return NextResponse.json({ ok: false, error: "No existe" }, { status: 404 });

    // ✅ borrar Cloudinary si tenemos publicId
    if (item.publicId) {
      try {
        await cloudinaryDestroy(item.publicId, item.resourceType === "video" ? "video" : "image");
      } catch (e) {
        console.warn("Cloudinary destroy failed:", e);
        // seguimos igual, pero podrías decidir fallar si querés
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
