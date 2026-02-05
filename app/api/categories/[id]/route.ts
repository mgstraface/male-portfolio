import { NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import { requireAdmin } from "@/lib/auth";

type CategoryUpdateBody = {
  name?: string;
  type?: "photo" | "video";
  active?: boolean;
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

    const category = await Category.findById(params.id);
    if (!category) {
      return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, category });
  } catch {
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin();
    await dbConnect();

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
    }

    const body = (await req.json()) as CategoryUpdateBody;

    const update: Record<string, unknown> = {};
    if (typeof body.name === "string") update.name = body.name.trim();
    if (body.type === "photo" || body.type === "video") update.type = body.type;
    if (typeof body.active === "boolean") update.active = body.active;

    const updated = await Category.findByIdAndUpdate(params.id, update, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, category: updated });
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
    requireAdmin();
    await dbConnect();

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
    }

    const deleted = await Category.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
