/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Media from "@/models/Media";
import { requireAdmin } from "@/lib/auth";
import { cloudinaryDestroy } from "@/lib/cloudinary-server";
import { z } from "zod";

const UpdateSchema = z.object({
  title: z.string().optional(),

  // ✅ projects
  album: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),

  // ✅ flags
  isFeatured: z.boolean().optional(),
  esPortada: z.boolean().optional(), // ✅ NUEVO

  fullVideoUrl: z.string().optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = await params;

    // ✅ Traemos el item actual para:
    // - saber el album actual si no viene en payload
    // - excluirlo del conteo de portadas
    const current = await Media.findById(id).lean();
    if (!current) return NextResponse.json({ ok: false, error: "No existe" }, { status: 404 });

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

    // ✅ album (vacío => null)
    let albumNormalized: string | null;
    if (typeof parsed.data.album === "string") {
      const a = parsed.data.album.trim();
      albumNormalized = a ? a : null;
      update.album = albumNormalized;
    } else {
      albumNormalized = (current as any)?.album ?? null;
    }

    if (typeof parsed.data.name === "string") update.name = parsed.data.name.trim();
    if (typeof parsed.data.description === "string") update.description = parsed.data.description.trim();
    if (typeof parsed.data.isFeatured === "boolean") update.isFeatured = parsed.data.isFeatured;
    if (typeof parsed.data.fullVideoUrl === "string") update.fullVideoUrl = parsed.data.fullVideoUrl.trim();

    // ✅ NUEVO: esPortada + regla máximo 2 por álbum
    if (typeof parsed.data.esPortada === "boolean") {
      const wantPortada = parsed.data.esPortada;

      if (wantPortada) {
        // si querés marcar como portada, necesitás album
        if (!albumNormalized) {
          return NextResponse.json(
            { ok: false, error: "Para marcar portada, el item debe tener Album" },
            { status: 400 }
          );
        }

        // contar portadas del álbum, excluyendo este item
        const count = await Media.countDocuments({
          album: albumNormalized,
          esPortada: true,
          _id: { $ne: id },
        });

        if (count >= 2) {
          return NextResponse.json(
            { ok: false, error: "Este álbum ya tiene 2 portadas" },
            { status: 400 }
          );
        }
      }

      update.esPortada = wantPortada;
    }

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
