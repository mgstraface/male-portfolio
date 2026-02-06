/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Media from "@/models/Media";
import cloudinary from "@/lib/cloudinary-server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = await ctx.params;

    const item = await Media.findById(id).populate("category");
    if (!item) {
      return NextResponse.json({ ok: false, error: "No existe" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = await ctx.params;

    const body = (await req.json()) as {
      title?: string;
      isFeatured?: boolean;
      fullVideoUrl?: string;
    };

    const item = await Media.findById(id).populate("category");
    if (!item) {
      return NextResponse.json({ ok: false, error: "No existe" }, { status: 404 });
    }

    if (typeof body.title === "string") {
      item.title = body.title.trim();
    }

    if (typeof body.isFeatured === "boolean") {
      item.isFeatured = body.isFeatured;
    }

    if (typeof body.fullVideoUrl === "string") {
      const v = body.fullVideoUrl.trim();
      if (item.type === "video" && v && !/^https?:\/\//i.test(v)) {
        return NextResponse.json(
          { ok: false, error: "fullVideoUrl inválida" },
          { status: 400 }
        );
      }
      (item as any).fullVideoUrl = v || undefined;
    }

    await item.save();

    const updated = await Media.findById(id).populate("category");
    return NextResponse.json({ ok: true, item: updated });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = await ctx.params;

    const item = await Media.findById(id);
    if (!item) {
      return NextResponse.json({ ok: false, error: "No existe" }, { status: 404 });
    }

    const publicId = (item as any).publicId as string | undefined;
    const resourceType = (item as any).resourceType as "image" | "video" | undefined;

    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: resourceType || "image",
          invalidate: true,
        });

        if (!resourceType) {
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "video",
            invalidate: true,
          });
        }
      } catch (e) {
        console.error("Cloudinary destroy error:", e);
      }
    }

    await Media.findByIdAndDelete(id);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
