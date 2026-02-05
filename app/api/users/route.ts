import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";

type CreateUserBody = {
  email?: string;
  password?: string;
};

export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();

    const users = await User.find({})
      .select("email role createdAt updatedAt")
      .sort({ createdAt: -1 });

    return NextResponse.json({ ok: true, users });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    await dbConnect();

    const body = (await req.json()) as CreateUserBody;
    const email = (body.email || "").toLowerCase().trim();
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "email y password son obligatorios" },
        { status: 400 }
      );
    }

    const exists = await User.findOne({ email }).select("_id");
    if (exists) {
      return NextResponse.json(
        { ok: false, error: "Ya existe un usuario con ese email" },
        { status: 409 }
      );
    }

    const hash = await bcrypt.hash(password, 10);

    const created = await User.create({
      email,
      password: hash,
      role: "admin",
    });

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: String(created._id),
          email: created.email,
          role: created.role,
          createdAt: created.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
