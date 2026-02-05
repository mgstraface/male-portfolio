import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAdmin();

    return NextResponse.json({
      ok: true,
      user: {
        id: user.sub,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
