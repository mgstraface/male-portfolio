/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Media from "@/models/Media";
import Category from "@/models/Category";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(24, Math.max(1, Number(searchParams.get("limit") || 6))); // albums por página

    // 1) category Projects
    const projectsCat = await Category.findOne({
      active: true,
      name: { $regex: /^projects?$/i },
    }).lean();

    if (!projectsCat?._id) {
      return NextResponse.json({ ok: true, page, limit, total: 0, projects: [] });
    }

    const skip = (page - 1) * limit;

    // 2) aggregation: agrupar por album (o por _id si album es null)
    const pipeline: any[] = [
      {
        $match: {
          category: projectsCat._id,
          type: { $in: ["photo", "video"] }, // ✅ incluye videos
        },
      },
      { $sort: { createdAt: -1 } },

      // albumKey: si no hay album => usar _id (álbum único por item suelto)
      {
        $addFields: {
          albumKey: {
            $ifNull: ["$album", { $toString: "$_id" }],
          },
        },
      },

      {
        $group: {
          _id: "$albumKey",
          album: { $first: "$album" }, // puede ser null si era suelto
          name: { $first: "$name" },
          description: { $first: "$description" },
          createdAt: { $first: "$createdAt" },
          items: {
            $push: {
              _id: "$_id",
              type: "$type",
              url: "$url",
              thumbnail: "$thumbnail",
              resourceType: "$resourceType",
              fullVideoUrl: "$fullVideoUrl",
              createdAt: "$createdAt",
            },
          },
          count: { $sum: 1 },
          hasVideo: {
            $max: { $cond: [{ $eq: ["$type", "video"] }, 1, 0] },
          },
        },
      },

      // orden de álbumes
      { $sort: { createdAt: -1 } },

      // pagination por álbum
      {
        $facet: {
          meta: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },

      {
        $project: {
          total: { $ifNull: [{ $arrayElemAt: ["$meta.total", 0] }, 0] },
          data: 1,
        },
      },
    ];

    const agg = await Media.aggregate(pipeline);
    const total = agg?.[0]?.total ?? 0;
    const data = agg?.[0]?.data ?? [];

    // shape final: cover + thumbs(2)
    const projects = data.map((g: any) => {
      const first = g.items?.[0];

      const cover =
        first?.type === "video"
          ? {
              type: "video",
              url: first.url,
              thumbnail: first.thumbnail || "",
              fullVideoUrl: first.fullVideoUrl || "",
            }
          : {
              type: "photo",
              url: first?.url,
            };

      const thumbs = (g.items || [])
        .filter((x: any) => x.type === "photo" || x.type === "video")
        .slice(0, 2)
        .map((x: any) => ({
          _id: x._id,
          type: x.type,
          url: x.url,
          thumbnail: x.thumbnail || "",
          fullVideoUrl: x.fullVideoUrl || "",
        }));

      return {
        album: g.album || g._id, // si era suelto, queda un id único
        name: g.name || g.album || "Proyecto",
        description: g.description || "",
        count: g.count || thumbs.length || 1,
        hasVideo: !!g.hasVideo,
        cover,
        thumbs,
      };
    });

    return NextResponse.json({
      ok: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      projects,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Error getProjects" }, { status: 500 });
  }
}
