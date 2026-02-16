/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

import dbConnect from "@/lib/db";
import Media from "@/models/Media";
import Category from "@/models/Category";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const CreateSchema = z.object({
  title: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),

  type: z.enum(["photo", "video"]),
  category: z.string(),
  url: z.string().min(1),

  album: z.string().optional(),

  // ✅ NUEVO
  esPortada: z.boolean().optional(),

  thumbnail: z.string().optional(),
  isFeatured: z.boolean().optional(),

  publicId: z.string().optional(),
  resourceType: z.enum(["image", "video"]).optional(),

  fullVideoUrl: z.string().optional(),
});

export async function GET() {
  try {
    await dbConnect();

    // ✅ público
    // (Opcional) portadas primero globalmente
    const items = await Media.find({})
      .populate("category")
      .sort({ esPortada: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ ok: true, items });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Error listando media" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    await dbConnect();

    const body = await req.json();
    const parsed = CreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Payload inválido", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      title,
      name,
      description,
      type,
      category,
      url,
      album,
      esPortada, // ✅ NUEVO
      thumbnail,
      isFeatured,
      publicId,
      resourceType,
      fullVideoUrl,
    } = parsed.data;

    // category existe?
    const cat = await Category.findById(category);
    if (!cat) {
      return NextResponse.json({ ok: false, error: "Categoría inválida" }, { status: 400 });
    }

    const albumNormalized = album?.trim() ? album.trim() : null;
    const esPortadaBool = !!esPortada;

    // ✅ Regla: máximo 2 portadas por álbum
    // (solo aplica si esPortada=true y hay album)
    if (esPortadaBool && albumNormalized) {
      const count = await Media.countDocuments({
        album: albumNormalized,
        esPortada: true,
      });

      if (count >= 2) {
        return NextResponse.json(
          { ok: false, error: "Este álbum ya tiene 2 portadas" },
          { status: 400 }
        );
      }
    }

    const item = await Media.create({
      title: title?.trim() || "",
      name: name?.trim() || "",
      description: description?.trim() || "",

      type,
      category,
      url,

      album: albumNormalized,

      // ✅ NUEVO
      esPortada: esPortadaBool,

      thumbnail: thumbnail?.trim() || "",
      isFeatured: !!isFeatured,

      publicId: publicId?.trim() || "",
      resourceType: resourceType || undefined,

      fullVideoUrl: fullVideoUrl?.trim() || "",
    });

    const populated = await Media.findById(item._id).populate("category").lean();

    return NextResponse.json({ ok: true, item: populated });
  } catch (e: any) {
    console.error(e);
    const msg = e?.message?.includes("Unauthorized") ? "No autorizado" : "Error creando media";
    const status = e?.message?.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
