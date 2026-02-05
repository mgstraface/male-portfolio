import jwt, { type JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import { getEnv } from "@/lib/env";

export type AuthUser = {
  sub: string;
  email: string;
  role: "admin";
};

function isAuthUser(p: JwtPayload): p is JwtPayload & AuthUser {
  return (
    typeof p.sub === "string" &&
    typeof p.email === "string" &&
    p.role === "admin"
  );
}

export async function requireAdmin(): Promise<AuthUser> {
  const cookieStore = await cookies(); // ✅ en tu Next es async
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("UNAUTHORIZED");

  const secret = getEnv("JWT_SECRET");
  const decoded = jwt.verify(token, secret);

  if (typeof decoded !== "object" || decoded === null) throw new Error("UNAUTHORIZED");
  if (!isAuthUser(decoded as JwtPayload)) throw new Error("UNAUTHORIZED");

  return decoded as AuthUser;
}
