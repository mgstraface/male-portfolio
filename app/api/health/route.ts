/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";



export async function GET() {
  try {
    const conn = await dbConnect();

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
