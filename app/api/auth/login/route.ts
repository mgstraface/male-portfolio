import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sign, type SignOptions } from "jsonwebtoken";
import { Types } from "mongoose";

import dbConnect from "@/lib/db";
import User from "@/models/User";
import { getEnv } from "@/lib/env";

type LoginBody = {
  email: string;
  password: string;
};

type SafeUser = {
  id: string;
  email: string;
  role: "admin";
};

function isLoginBody(value: unknown): value is LoginBody {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.email === "string" && typeof v.password === "string";
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const raw: unknown = await req.json();

    if (!isLoginBody(raw)) {
      return NextResponse.json(
        { ok: false, error: "Body inválido. Se espera { email, password }" },
        { status: 400 }
      );
    }

    const email = raw.email.toLowerCase().trim();
    const password = raw.password;

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email y password son obligatorios" },
        { status: 400 }
      );
    }

    const userDoc = await User.findOne({ email }).select("email password role");

    if (!userDoc) {
      return NextResponse.json(
        { ok: false, error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const user = {
      _id: userDoc._id as Types.ObjectId,
      email: String(userDoc.email),
      password: String(userDoc.password),
      role: (userDoc.role as "admin") || "admin",
    };

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const jwtSecret = getEnv("JWT_SECRET");
    const expiresIn: SignOptions["expiresIn"] =
      (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

    const token = sign(
      { sub: user._id.toString(), role: user.role, email: user.email },
      jwtSecret,
      { expiresIn }
    );

    const safeUser: SafeUser = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const res = NextResponse.json({ ok: true, user: safeUser });

    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("LOGIN_ERROR:", message);

    return NextResponse.json(
      { ok: false, error: "Error interno" },
      { status: 500 }
    );
  }
}
