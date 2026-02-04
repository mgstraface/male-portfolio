/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";



export async function GET() {
  try {
    const conn = await connectDB();

    return NextResponse.json({
      ok: true,
      database: "connected",
      host: conn.connection.host,
      name: conn.connection.name,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        database: "disconnected",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
