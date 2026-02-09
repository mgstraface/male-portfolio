/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

import dbConnect from "@/lib/db";
import Media from "@/models/Media";
import Category from "@/models/Category";

export async function GET() {
  try {
    await dbConnect();

    const cat = await Category.findOne({ name: /^(projects|project)$/i }).select("_id").lean();
    if (!cat?._id) {
      return NextResponse.json(
        { ok: false, error: "No existe la categoría Projects" },
        { status: 404 }
      );
    }

    const projects = await Media.aggregate([
      { $match: { category: cat._id } },
      { $sort: { createdAt: 1 } },

      // ✅ normalizamos album: trim + vacío => null
      {
        $addFields: {
          albumNorm: {
            $let: {
              vars: { a: { $ifNull: ["$album", ""] } },
              in: {
                $cond: [
                  { $gt: [{ $strLenCP: { $trim: { input: "$$a" } } }, 0] },
                  { $trim: { input: "$$a" } },
                  null,
                ],
              },
            },
          },
        },
      },

      // ✅ clave de agrupación: albumNorm o _id (singleton)
      {
        $addFields: {
          albumKey: { $ifNull: ["$albumNorm", { $toString: "$_id" }] },
        },
      },

      {
        $group: {
          _id: "$albumKey",
          album: { $first: "$albumNorm" },
          count: { $sum: 1 },
          lastCreatedAt: { $max: "$createdAt" },
          types: { $addToSet: "$type" },
          items: {
            $push: {
              _id: "$_id",
              title: "$title",
              album: "$albumNorm",
              name: "$name",
              description: "$description",
              type: "$type",
              url: "$url",
              thumbnail: "$thumbnail",
              isFeatured: "$isFeatured",
              publicId: "$publicId",
              resourceType: "$resourceType",
              fullVideoUrl: "$fullVideoUrl",
              createdAt: "$createdAt",
            },
          },
        },
      },

      { $sort: { lastCreatedAt: -1 } },

      {
        $project: {
          _id: 0,
          key: "$_id",
          album: 1,
          count: 1,
          lastCreatedAt: 1,
          types: 1,
          cover: { $arrayElemAt: ["$items", 0] },
          items: 1,
        },
      },
    ]);

    return NextResponse.json({ ok: true, projects });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Error trayendo projects" }, { status: 500 });
  }
}
