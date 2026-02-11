import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";
import { requireAdmin } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = await params;
    const body = (await req.json()) as { read?: boolean };

    const item = await Contact.findById(id);
    if (!item) {
      return NextResponse.json({ ok: false, error: "No existe" }, { status: 404 });
    }

    if (typeof body.read === "boolean") {
      item.read = body.read;
    }

    await item.save();
    return NextResponse.json({ ok: true, message: item });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = await params;

    const item = await Contact.findById(id);
    if (!item) {
      return NextResponse.json({ ok: false, error: "No existe" }, { status: 404 });
    }

    await Contact.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
