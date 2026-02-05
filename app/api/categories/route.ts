import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import { requireAdmin } from "@/lib/auth";

type CategoryBody = {
  name?: string;
  type?: "photo" | "video";
  active?: boolean;
};

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // photo | video
    const active = searchParams.get("active"); // true | false

    const filter: Record<string, unknown> = {};
    if (type === "photo" || type === "video") filter.type = type;
    if (active === "true") filter.active = true;
    if (active === "false") filter.active = false;

    const categories = await Category.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ ok: true, categories });
  } catch (err: unknown) {
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    requireAdmin();
    await dbConnect();

    const body = (await req.json()) as CategoryBody;

    const name = (body.name || "").trim();
    const type = body.type;

    if (!name || (type !== "photo" && type !== "video")) {
      return NextResponse.json(
        { ok: false, error: "name y type (photo|video) son obligatorios" },
        { status: 400 }
      );
    }

    const active = typeof body.active === "boolean" ? body.active : true;

    const created = await Category.create({ name, type, active });

    return NextResponse.json({ ok: true, category: created }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
