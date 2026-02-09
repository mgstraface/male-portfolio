/* eslint-disable @typescript-eslint/no-explicit-any */
/* app/public/ProjectsSection.tsx */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useMemo, useState } from "react";

type ProjectThumb = {
  _id: string;
  type: "photo" | "video";
  url: string;
  thumbnail?: string;
  fullVideoUrl?: string;
};

type ProjectMediaItem = ProjectThumb & {
  title?: string;
  name?: string;
  description?: string;
};

type ProjectApiGroup = {
  album: string; // viene album || key
  name: string;
  description: string;
  count: number;
  hasVideo: boolean;
  cover: {
    type: "photo" | "video";
    url: string;
    thumbnail?: string;
    fullVideoUrl?: string;
  };
  thumbs: ProjectThumb[]; // max 2
};

type ProjectsApiResponse =
  | {
      ok: true;
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      projects: ProjectApiGroup[];
    }
  | { ok: false; error: string };

type AlbumItemsResponse =
  | { ok: true; items: ProjectMediaItem[] }
  | { ok: false; error: string };

function isProbablyVideo(item: { type?: string; thumbnail?: string; url: string }) {
  if (item.type === "video") return true;
  if (item.thumbnail) return true;
  return /\.(mp4|webm|mov|m4v)$/i.test(item.url);
}

function MediaThumb({
  item,
  className = "",
  showPlay = false,
  onMeta,
}: {
  item: ProjectMediaItem;
  className?: string;
  showPlay?: boolean;
  onMeta?: (meta: { horizontal: boolean }) => void;
}) {
  const isVideo = isProbablyVideo(item);
  const poster = isVideo ? item.thumbnail || item.url : item.url;

  // hover-play: sólo si es video y tenemos un src reproducible
  const canHoverPlay = isVideo && !!item.url && !/\.(jpg|jpeg|png|webp|gif)$/i.test(item.url);

  const handleEnter = (e: React.MouseEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    try {
      v.currentTime = 0;
      void v.play();
    } catch {}
  };

  const handleLeave = (e: React.MouseEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    try {
      v.pause();
      v.currentTime = 0;
    } catch {}
  };

  return (
    <div
      className={[
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5",
        "transition-transform duration-300 will-change-transform hover:scale-[1.03]",
        className,
      ].join(" ")}
    >
      {/* poster BN base */}
      <img
        src={poster}
        alt={item.name || item.title || "media"}
        className={[
          "absolute inset-0 h-full w-full object-cover",
          "transition duration-300",
          "filter grayscale contrast-125 brightness-90",
          "group-hover:grayscale-0 group-hover:brightness-100",
        ].join(" ")}
        loading="lazy"
        onLoad={(e) => {
          const img = e.currentTarget;
          if (onMeta && img.naturalWidth && img.naturalHeight) {
            onMeta({ horizontal: img.naturalWidth >= img.naturalHeight });
          }
        }}
      />

      {/* hover video encima */}
      {canHoverPlay && (
        <video
          src={item.url}
          muted
          playsInline
          loop
          preload="metadata"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          className={[
            "absolute inset-0 h-full w-full object-cover",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          ].join(" ")}
        />
      )}

      {/* play overlay */}
      {showPlay && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div
            className={[
              "h-14 w-14 rounded-full",
              "bg-black/60 backdrop-blur",
              "grid place-items-center",
              "border border-white/20",
              "transition-transform duration-300",
              "group-hover:scale-105",
            ].join(" ")}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 18V6l10 6-10 6Z" fill="white" opacity="0.95" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

function Modal({
  open,
  title,
  description,
  items,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  items: ProjectMediaItem[];
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute inset-x-0 top-10 mx-auto w-[min(1100px,92vw)]">
        <div className="rounded-3xl border border-white/10 bg-black p-6 md:p-8 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs tracking-widest text-white/40 uppercase">Project</div>
              <h3 className="mt-1 text-2xl md:text-3xl font-semibold text-white">{title}</h3>
              {description ? <p className="mt-2 text-white/70">{description}</p> : null}
            </div>

            <button
              onClick={onClose}
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
              type="button"
            >
              Cerrar
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => {
              const isVid = isProbablyVideo(it);
              const poster = isVid ? it.thumbnail || it.url : it.url;

              return (
                <div
                  key={it._id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                >
                  <div className="aspect-[4/3] w-full">
                    <img
                      src={poster}
                      alt={it.name || it.title || "media"}
                      className={[
                        "h-full w-full object-cover",
                        "transition duration-300",
                        "filter grayscale contrast-125 brightness-90",
                        "group-hover:grayscale-0 group-hover:brightness-100",
                      ].join(" ")}
                    />
                    {isVid && (
                      <div className="pointer-events-none absolute inset-0 grid place-items-center">
                        <div className="h-12 w-12 rounded-full bg-black/60 border border-white/20 grid place-items-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path d="M9 18V6l10 6-10 6Z" fill="white" opacity="0.95" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({
  group,
  index,
  onOpen,
}: {
  group: ProjectApiGroup;
  index: number;
  onOpen: (g: ProjectApiGroup) => void;
}) {
  const isFirst = index === 0;
  const bg = isFirst ? "bg-[#C81D25]" : "bg-black";

  const title = group.name || group.album || "Proyecto";
  const desc = group.description || "";

  const count = group.count || 1;
  const thumbs = group.thumbs || [];
  const showTwo = count >= 2 && thumbs.length >= 2;
  const more = Math.max(0, count - (showTwo ? 2 : 1));

  // detectar orientación para decidir layout (lado a lado vs stacked)
  const [thumb0Horizontal, setThumb0Horizontal] = useState<boolean | null>(null);
  const [thumb1Horizontal, setThumb1Horizontal] = useState<boolean | null>(null);

  const stackVertical =
    showTwo && ((thumb0Horizontal ?? false) || (thumb1Horizontal ?? false)); // si alguna es horizontal => stack

  const coverItem: ProjectMediaItem = { ...group.cover, _id: `${group.album}-cover` };

  // altura fija para media, así no cambia la card por orientación
 // antes tenías distintos altos (single más alto)
// const MEDIA_H = "h-[260px] md:h-[340px]";
// const TWO_H = "h-[220px] md:h-[260px]";

const MEDIA_SLOT_H = "h-[220px] md:h-[260px]"; // ✅ mismo alto para todos

  const isSingleVideo = !showTwo && coverItem.type === "video";

  return (
    <article className={["rounded-[28px] border border-white/10", bg, "p-6 md:p-8"].join(" ")}>
      <div className="grid items-start gap-6 md:grid-cols-12">
        {/* TEXTO */}
        <div className="md:col-span-5 flex flex-col">
          <div className="text-[11px] tracking-widest text-white/60 uppercase">Project</div>

          <h3 className="mt-2 text-2xl md:text-[28px] font-semibold tracking-tight text-white">
            {title}
          </h3>

          {desc ? (
            <p className="mt-3 text-white/75 leading-relaxed">{desc}</p>
          ) : (
            <p className="mt-3 text-white/55 leading-relaxed">Proyecto sin descripción.</p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
              {count} {count === 1 ? "archivo" : "archivos"}
            </span>

            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
              {group.hasVideo ? (count > 1 ? "Foto + Video" : "Video") : "Foto"}
            </span>
          </div>

          {/* ✅ Botón “Ver” abajo de todo (queda más prolijo) */}
          <div className="mt-6">
            <button
              onClick={() => onOpen(group)}
              className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm text-white hover:bg-white/10"
              type="button"
            >
              Ver
            </button>
          </div>
        </div>

        {/* MEDIA */}
        <div className="md:col-span-7">
          {/* SINGLE grande */}
      {!showTwo && (
  <MediaThumb
    item={{ ...coverItem, name: title, description: desc }}
    showPlay={isSingleVideo}
    className={MEDIA_SLOT_H}   // ✅ antes MEDIA_H
  />
)}


          {/* DOBLE preview */}
          {showTwo && (
            <div className={["relative w-full", MEDIA_SLOT_H].join(" ")}>
              <div
                className={[
                  "h-full w-full grid gap-4",
                  stackVertical ? "grid-cols-1 grid-rows-2" : "grid-cols-2",
                ].join(" ")}
              >
                <MediaThumb
                  item={{ ...thumbs[0], name: title, description: desc }}
                  className="h-full"
                  showPlay={thumbs[0].type === "video" || isProbablyVideo(thumbs[0])}
                  onMeta={({ horizontal }) => setThumb0Horizontal(horizontal)}
                />
                <MediaThumb
                  item={{ ...thumbs[1], name: title, description: desc }}
                  className="h-full"
                  showPlay={thumbs[1].type === "video" || isProbablyVideo(thumbs[1])}
                  onMeta={({ horizontal }) => setThumb1Horizontal(horizontal)}
                />
              </div>

              {more > 0 && (
                <div className="pointer-events-none absolute right-3 top-3 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs text-white backdrop-blur">
                  +{more}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ProjectsSection({
  initial,
  title = "Projects",
  subtitle = "Selección de proyectos y sesiones",
  pageSize = 6,
}: {
  initial: ProjectsApiResponse;
  title?: string;
  subtitle?: string;
  pageSize?: number;
}) {
  const initialOk = initial && (initial as any).ok;

  const [groups, setGroups] = useState<ProjectApiGroup[]>(initialOk ? (initial as any).projects || [] : []);
  const [page, setPage] = useState<number>(initialOk ? (initial as any).page || 1 : 1);
  const [totalPages, setTotalPages] = useState<number>(initialOk ? (initial as any).totalPages || 1 : 1);

  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(!initialOk ? (initial as any)?.error || "Error" : null);

  const canLoadMore = useMemo(() => page < totalPages, [page, totalPages]);

  // modal
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ProjectApiGroup | null>(null);
  const [albumItems, setAlbumItems] = useState<ProjectMediaItem[]>([]);
  const [albumLoading, setAlbumLoading] = useState(false);

  const openModal = async (g: ProjectApiGroup) => {
    setActive(g);
    setOpen(true);

    // fallback rápido con lo que ya tenemos
    const fallback: ProjectMediaItem[] = [
      { ...g.cover, _id: `${g.album}-cover`, name: g.name, description: g.description },
      ...(g.thumbs || []).map((t) => ({ ...t, name: g.name, description: g.description })),
    ];
    setAlbumItems(fallback);

    // si hay más items que los thumbs, intentamos pedir el álbum completo
    if ((g.count || 0) > (g.thumbs?.length || 0)) {
      setAlbumLoading(true);
      try {
        // 🔁 CAMBIÁ ESTA RUTA si tu endpoint es otro:
        const res = await fetch(`/api/media/projects/album?album=${encodeURIComponent(g.album)}`, {
          cache: "no-store",
        });

        const data = (await res.json()) as AlbumItemsResponse;

        if (res.ok && data.ok && Array.isArray(data.items)) {
          setAlbumItems(
            data.items.map((it) => ({
              ...it,
              name: it.name || g.name,
              description: it.description || g.description,
            }))
          );
        }
      } catch {
        // si falla, nos quedamos con fallback
      } finally {
        setAlbumLoading(false);
      }
    }
  };

  const closeModal = () => {
    setOpen(false);
    setActive(null);
    setAlbumItems([]);
    setAlbumLoading(false);
  };

  const loadMore = async () => {
    if (!canLoadMore || loadingMore) return;

    setLoadingMore(true);
    setError(null);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/media/projects?page=${nextPage}&limit=${pageSize}`, {
        cache: "no-store",
      });
      const data = (await res.json()) as ProjectsApiResponse;

      if (!res.ok || !data.ok) throw new Error(!data.ok ? data.error : "Error cargando más");

      setGroups((prev) => {
        const map = new Map<string, ProjectApiGroup>();
        for (const g of prev) map.set(g.album, g);
        for (const g of data.projects) map.set(g.album, g);
        return Array.from(map.values());
      });

      setPage((data as any).page);
      setTotalPages((data as any).totalPages);
    } catch (e: any) {
      setError(e?.message || "Error cargando más");
    } finally {
      setLoadingMore(false);
    }
  };

  if (!groups || groups.length === 0) return null;

  return (
    <section id="projects" className="space-y-6">
      <header className="space-y-2">
        <div className="text-xs tracking-widest text-white/40 uppercase">{title}</div>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">{subtitle}</h2>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-200/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {groups.map((g, i) => (
          <ProjectCard key={g.album} group={g} index={i} onOpen={openModal} />
        ))}
      </div>

      {/* ✅ “Cargar más” abajo de todo */}
      {canLoadMore && (
        <div className="pt-2 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm text-white hover:bg-white/10 disabled:opacity-50"
            type="button"
          >
            {loadingMore ? "Cargando..." : "Cargar más"}
          </button>
        </div>
      )}

      <Modal
        open={open}
        title={active?.name || active?.album || "Proyecto"}
        description={
          (albumLoading ? `${active?.description || ""} (cargando...)` : active?.description) || ""
        }
        items={albumItems}
        onClose={closeModal}
      />
    </section>
  );
}
