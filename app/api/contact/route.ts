import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";
import { requireAdmin } from "@/lib/auth";

type ContactBody = {
  name?: string;
  email?: string;
  message?: string;
};

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = (await req.json()) as ContactBody;

    const name = (body.name || "").trim();
    const email = (body.email || "").toLowerCase().trim();
    const message = (body.message || "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "name, email y message son obligatorios" },
        { status: 400 }
      );
    }

    const ua = req.headers.get("user-agent") || undefined;

    const created = await Contact.create({
      name,
      email,
      message,
      read: false,
      userAgent: ua,
    });

    return NextResponse.json({ ok: true, contact: created }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
   await requireAdmin();
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const read = searchParams.get("read"); // true|false

    const filter: Record<string, unknown> = {};
    if (read === "true") filter.read = true;
    if (read === "false") filter.read = false;

    const messages = await Contact.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ ok: true, messages });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
