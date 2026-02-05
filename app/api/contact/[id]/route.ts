import { NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";
import { requireAdmin } from "@/lib/auth";

type ContactUpdateBody = {
  read?: boolean;
};

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    await dbConnect();

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
    }

    const body = (await req.json()) as ContactUpdateBody;
    const update: Record<string, unknown> = {};
    if (typeof body.read === "boolean") update.read = body.read;

    const updated = await Contact.findByIdAndUpdate(params.id, update, { new: true });
    if (!updated) return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });

    return NextResponse.json({ ok: true, message: updated });
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
    await requireAdmin();
    await dbConnect();

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
    }

    const deleted = await Contact.findByIdAndDelete(params.id);
    if (!deleted) return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
