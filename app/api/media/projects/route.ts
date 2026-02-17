/* eslint-disable @typescript-eslint/no-explicit-any */
/* app/api/media/projects/route.ts */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Media from "@/models/Media";
import Category from "@/models/Category";

function num(v: string | null, d: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : d;
}

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = num(searchParams.get("page"), 1);
    const limit = Math.min(num(searchParams.get("limit"), 6), 24);
    const skip = (page - 1) * limit;

    // categorías Projects / Project
    const cats = await Category.find({
      name: { $in: ["Projects", "projects", "Project", "project"] },
      active: true,
    })
      .select("_id")
      .lean();

    const catIds = cats.map((c: any) => c._id);
    if (catIds.length === 0) {
      return NextResponse.json({
        ok: true,
        page,
        limit,
        total: 0,
        totalPages: 0,
        projects: [],
      });
    }

    const baseMatch: any = {
      category: { $in: catIds },
      album: { $ne: null },
      $expr: { $gt: [{ $strLenCP: "$album" }, 0] }, // album no vacío
    };

    // total de grupos (álbumes)
    const totalAgg = await Media.aggregate([
      { $match: baseMatch },
      { $group: { _id: "$album" } },
      { $count: "total" },
    ]);

    const total = totalAgg?.[0]?.total || 0;
    const totalPages = total ? Math.ceil(total / limit) : 0;

    /**
     * ✅ Clave:
     * - Normalizamos esPortada a number (1/0)
     * - Ordenamos primero por portada, luego por createdAt desc
     * - Así $first y $push quedan "portada-first"
     */
    const projects = await Media.aggregate([
      { $match: baseMatch },

      {
        $addFields: {
          _isPortada: { $cond: [{ $eq: ["$esPortada", true] }, 1, 0] },
        },
      },

      // primero portadas, después lo más nuevo
      { $sort: { _isPortada: -1, createdAt: -1 } },

      {
        $group: {
          _id: "$album",

          // meta (como ya ordenamos, esto agarra portada si existe)
          album: { $first: "$album" },
          name: { $first: "$name" },
          description: { $first: "$description" },

          count: { $sum: 1 },

          hasVideo: {
            $max: {
              $cond: [{ $eq: ["$type", "video"] }, 1, 0],
            },
          },

          lastCreatedAt: { $max: "$createdAt" },

          // cover = portada si existe, sino el más reciente
          cover: {
            $first: {
              type: "$type",
              url: "$url",
              thumbnail: "$thumbnail",
              fullVideoUrl: "$fullVideoUrl",
              esPortada: "$esPortada",
            },
          },

          // thumbs ordenados (portadas primero)
          thumbsAll: {
            $push: {
              _id: "$_id",
              type: "$type",
              url: "$url",
              thumbnail: "$thumbnail",
              fullVideoUrl: "$fullVideoUrl",
              esPortada: "$esPortada",
            },
          },
        },
      },

      { $addFields: { thumbs: { $slice: ["$thumbsAll", 2] }, hasVideo: { $eq: ["$hasVideo", 1] } } },
      { $project: { thumbsAll: 0, _isPortada: 0 } },

      // orden final de grupos por el más nuevo (no por portada)
      { $sort: { lastCreatedAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    return NextResponse.json({
      ok: true,
      page,
      limit,
      total,
      totalPages,
      projects,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Error listando projects" }, { status: 500 });
  }
}
