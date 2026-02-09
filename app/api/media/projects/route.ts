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
    const limit = Math.min(24, Math.max(1, Number(searchParams.get("limit") || 6)));
    const skip = (page - 1) * limit;

    // ✅ traer TODAS las categories "Projects" (photo + video)
    const projectsCats = await Category.find({
      active: true,
      name: { $regex: /^projects?$/i },
    })
      .select({ _id: 1 })
      .lean();

    const catIds = projectsCats.map((c) => c._id);
    if (catIds.length === 0) {
      return NextResponse.json({ ok: true, page, limit, total: 0, totalPages: 0, projects: [] });
    }

    const pipeline: any[] = [
      {
        $match: {
          category: { $in: catIds }, // ✅ ahora entra el video también
          type: { $in: ["photo", "video"] },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          albumKey: { $ifNull: ["$album", { $toString: "$_id" }] },
        },
      },
      {
        $group: {
          _id: "$albumKey",
          album: { $first: "$album" },
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
          hasVideo: { $max: { $cond: [{ $eq: ["$type", "video"] }, 1, 0] } },
        },
      },
      { $sort: { createdAt: -1 } },
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
          : { type: "photo", url: first?.url };

      const thumbs = (g.items || []).slice(0, 2).map((x: any) => ({
        _id: x._id,
        type: x.type,
        url: x.url,
        thumbnail: x.thumbnail || "",
        fullVideoUrl: x.fullVideoUrl || "",
      }));

      return {
        album: g.album || g._id,
        name: g.name || g.album || "Proyecto",
        description: g.description || "",
        count: g.count || 1,
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
