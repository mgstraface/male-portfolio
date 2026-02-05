import { NextResponse } from "next/server";
import { Types } from "mongoose";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";

type UpdateUserBody = {
  email?: string;
  password?: string;
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

    const body = (await req.json()) as UpdateUserBody;

    const update: Record<string, unknown> = {};

    if (typeof body.email === "string") {
      const email = body.email.toLowerCase().trim();
      if (!email) {
        return NextResponse.json({ ok: false, error: "Email inválido" }, { status: 400 });
      }

      const exists = await User.findOne({ email }).select("_id");
      if (exists && String(exists._id) !== params.id) {
        return NextResponse.json(
          { ok: false, error: "Ya existe otro usuario con ese email" },
          { status: 409 }
        );
      }

      update.email = email;
    }

    if (typeof body.password === "string") {
      const pass = body.password;
      if (!pass) {
        return NextResponse.json({ ok: false, error: "Password inválida" }, { status: 400 });
      }
      update.password = await bcrypt.hash(pass, 10);
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { ok: false, error: "Nada para actualizar" },
        { status: 400 }
      );
    }

    const updated = await User.findByIdAndUpdate(params.id, update, { new: true })
      .select("email role createdAt updatedAt");

    if (!updated) {
      return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, user: updated });
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

    const deleted = await User.findByIdAndDelete(params.id).select("_id");
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
