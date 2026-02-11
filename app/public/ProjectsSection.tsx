/* eslint-disable @typescript-eslint/no-explicit-any */
/* app/public/ProjectsSection.tsx */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useState } from "react";

type ProjectThumb = {
  _id: string;
  type: "photo" | "video"; // legacy (NO confiable)
  url: string;
  thumbnail?: string;
  fullVideoUrl?: string;

  name?: string;
  description?: string;
  title?: string;
};

type ProjectApiGroup = {
  _id?: string;
  album: string;
  name: string;
  description: string;
  count: number;
  hasVideo: boolean;
  lastCreatedAt?: string;

  cover: {
    type: "photo" | "video"; // legacy (NO confiable)
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
  | { ok: true; album: string; items: ProjectThumb[] }
  | { ok: false; error: string };

function cn(...arr: Array<string | false | undefined | null>) {
  return arr.filter(Boolean).join(" ");
}

/* -----------------------------
   🔥 Fuentes de verdad:
   - cloudinary image: /image/upload/
   - cloudinary video: /video/upload/
   Nunca confiar en `type`.
-------------------------------- */
function cloudinaryKindFromUrl(url?: string): "image" | "video" | "unknown" {
  const u = (url || "").toLowerCase();
  if (!u) return "unknown";
  if (u.includes("/video/upload/")) return "video";
  if (u.includes("/image/upload/")) return "image";
  return "unknown";
}

function isImageUrl(url?: string) {
  const k = cloudinaryKindFromUrl(url);
  if (k === "image") return true;
  return /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(url || "");
}

function isVideoUrl(url?: string) {
  const k = cloudinaryKindFromUrl(url);
  if (k === "video") return true;
  return /\.(mp4|webm|mov|m4v)$/i.test(url || "");
}

function pickPosterImage(it?: { url?: string; thumbnail?: string }) {
  if (!it) return undefined;
  if (it.thumbnail && isImageUrl(it.thumbnail)) return it.thumbnail;
  if (it.url && isImageUrl(it.url)) return it.url;
  return undefined;
}

function MediaThumb({
  item,
  onOrientation,
  className = "",
  showPlayIcon = false,
  onClick,
}: {
  item: { url: string; thumbnail?: string };
  onOrientation?: (o: "h" | "v") => void;
  className?: string;
  showPlayIcon?: boolean;
  onClick?: () => void;
}) {
  const isVideo = isVideoUrl(item.url);
  const poster = pickPosterImage(item) || item.url;

  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const play = () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.currentTime = 0;
      void v.play();
    } catch {}
  };

  const stop = () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.pause();
      v.currentTime = 0;
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={() => isVideo && play()}
      onPointerLeave={() => isVideo && stop()}
      className={cn(
        "group relative overflow-hidden rounded-1xl border border-white/10 bg-white/5 text-left",
        "transition-transform duration-300 will-change-transform hover:scale-[1.02]",
        className
      )}
    >
      <img
        src={poster}
        alt="thumb"
        className={cn(
          "absolute inset-0 h-full w-full object-cover",
          "transition duration-300 will-change-transform",
          "filter grayscale contrast-125 brightness-90",
          "group-hover:grayscale-0 group-hover:brightness-100",
          "group-hover:scale-[1.03]"
        )}
        loading="lazy"
        onLoad={(e) => {
          const img = e.currentTarget;
          const o = img.naturalWidth >= img.naturalHeight ? "h" : "v";
          onOrientation?.(o);
        }}
        ref={(img) => {
          if (!img) return;
          if (img.complete && img.naturalWidth && img.naturalHeight) {
            const o = img.naturalWidth >= img.naturalHeight ? "h" : "v";
            onOrientation?.(o);
          }
        }}
      />

      {isVideo && (
        <video
          ref={videoRef}
          src={item.url}
          muted
          playsInline
          loop
          preload="auto"
          className={cn(
            "absolute inset-0 h-full w-full object-cover",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          )}
        />
      )}

      {showPlayIcon && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div
            className={cn(
              "h-14 w-14 rounded-full",
              "bg-black/60 backdrop-blur",
              "grid place-items-center",
              "border border-white/20",
              "transition-all duration-200",
              "opacity-0 group-hover:opacity-100",
              "group-hover:scale-105"
            )}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 18V6l10 6-10 6Z" fill="white" opacity="0.95" />
            </svg>
          </div>
        </div>
      )}
    </button>
  );
}

/** ---------- Modal ---------- */
function ProjectModal({
  open,
  onClose,
  album,
  title,
  description,
  initialItems,
}: {
  open: boolean;
  onClose: () => void;
  album: string;
  title: string;
  description: string;
  initialItems: ProjectThumb[];
}) {
  const [items, setItems] = useState<ProjectThumb[]>(initialItems || []);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let alive = true;
    setErr(null);
    setLoading(true);
    setActive(0);

    (async () => {
      try {
        const res = await fetch(`/api/media/projects/${encodeURIComponent(album)}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as AlbumItemsResponse;
        if (!res.ok || !data.ok) throw new Error(!data.ok ? data.error : "Error cargando álbum");
        if (!alive) return;

        const seen = new Set<string>();
        const clean = (data.items || []).filter((x) => {
          const k = String((x as any)._id || x.url);
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });

        setItems(clean);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Error cargando álbum");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, album]);
  // ✅ Bloquear scroll del background mientras el modal está abierto
  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const current = items[active];
  const currentIsVideo = !!current && isVideoUrl(current.url);
  const poster = currentIsVideo ? pickPosterImage(current) : undefined;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
     <div
  className={cn(
    "relative w-full max-w-6xl",
    "rounded-2xl border border-white/10 bg-black",
    "shadow-2xl",
    "max-h-[86vh] overflow-hidden",
    "flex flex-col" // ✅ para separar header/body
  )}
>

          <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
            <div>
              {/* <div className="text-xs tracking-widest text-white/40 uppercase">Project</div> */}
              <div style={{ fontFamily: "var(--font-battle)", fontSize: "3rem" }} className="mt-1 text-2xl font-semibold text-white">{title}</div>
              {description ? <div style={{ fontSize: "1.3rem" }} className="mt-2 text-sm text-white/70">{description}</div> : null}
            </div>

            <button
              onClick={onClose}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
              type="button"
            >
              Cerrar
            </button>
          </div>

          <div className="px-6 py-5 overflow-y-auto">

            {err && (
              <div className="mb-4 rounded-2xl border border-red-200/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {err}
              </div>
            )}

            <div className="rounded-1xl border border-white/10 bg-white/5 p-3">
              <div className="relative overflow-hidden rounded-2xl bg-black">
                <div className="h-[42vh] md:h-[50vh]">
                  {!current ? (
                    <div className="h-full w-full grid place-items-center text-white/60">
                      Sin archivos
                    </div>
                  ) : currentIsVideo ? (
                    <video
                      src={current.url}
                      controls
                      playsInline
                      className="h-full w-full object-contain bg-black"
                      poster={poster}
                    />
                  ) : (
                    <img src={current.url} alt="preview" className="h-full w-full object-contain bg-black" />
                  )}
                </div>
              </div>

              {currentIsVideo && current?.fullVideoUrl ? (
                <div className="mt-3 flex justify-end">
                  <a
                    href={current.fullVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
                  >
                    Ver video completo
                  </a>
                </div>
              ) : null}
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div className="text-xs tracking-widest text-white/40 uppercase">
                  {loading ? "Cargando..." : `${items.length} archivo${items.length === 1 ? "" : "s"}`}
                </div>
              </div>

              <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                {items.map((it, idx) => {
                  const itIsVideo = isVideoUrl(it.url);
                  const tPoster = pickPosterImage(it) || it.url;

                  return (
                    <button
                      key={String((it as any)._id || it.url)}
                      onClick={() => setActive(idx)}
                      className={cn(
                        "relative shrink-0 overflow-hidden rounded-1xl border bg-white/5",
                        "h-24 w-36 md:h-28 md:w-44",
                        idx === active ? "border-white/40" : "border-white/10 hover:border-white/25"
                      )}
                      type="button"
                      title={itIsVideo ? "Video" : "Foto"}
                    >
                      <img
                        src={tPoster}
                        alt="thumb"
                        className={cn(
                          "absolute inset-0 h-full w-full object-cover",
                          "filter grayscale contrast-125 brightness-90",
                          "hover:grayscale-0 hover:brightness-100 transition"
                        )}
                        loading="lazy"
                      />
                      {itIsVideo && (
                        <div className="absolute right-2 top-2 rounded-full bg-black/60 border border-white/20 px-2 py-1 text-[10px] text-white">
                          video
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ---------- Card ---------- */
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

  const videoThumb = thumbs.find((t) => isVideoUrl(t.url));
  const imageThumb = thumbs.find((t) => isImageUrl(t.url));

  const forceSingle = !!videoThumb && !!imageThumb;
  const posterImage = imageThumb?.url;

  const showTwo = !forceSingle && count >= 2 && thumbs.length >= 2;

  const [o1, setO1] = useState<"h" | "v">("v");
  const [o2, setO2] = useState<"h" | "v">("v");

  const stackVertical = showTwo && o1 === "h" && o2 === "h";
  const more = Math.max(0, count - (showTwo ? 2 : 1));
  const MEDIA_H = "h-[320px] md:h-[340px]";

  return (
   <article
  className={cn(
    "rounded-[0px] overflow-hidden",
    "border border-white/25 ring-2 ring-white/15 ring-inset",

    "ring-2 ring-white/10",        // 👈 engorda visual
    "ring-inset",                  // 👈 que sea hacia adentro
    bg,
    "p-6 md:p-8"
  )}
>
      <div className="grid items-start gap-6 md:grid-cols-12">
        {/* TEXTO */}
        <div className="md:col-span-5 flex flex-col h-full">
          <div className="relative mt-2">
            {/* ✅ OUTLINE: ocupa el ancho pero NO genera overflow horizontal */}
            <div
              aria-hidden
              style={{ fontFamily: "var(--font-outline)" }}
              className="
                absolute -top-2 inset-x-0
                uppercase
                leading-none tracking-widest
                text-white/12
                text-[64px] md:text-[90px] lg:text-[110px]
                pointer-events-none
                text-center
                select-none
              "
            >
              {title}
            </div>

            <div className="relative pt-10">
              <div style={{ fontFamily: "var(--font-battle)" }} className="text-4xl md:text-5xl  text-white">{title}</div>
            </div>
          </div>

          {desc ? (
            <p style={{ fontFamily: "var(--font-nunito)" }}  className="mt-3 text-white/75 leading-relaxed text-2xl md:text-xl ">{desc}</p>
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

          <button
            type="button"
            onClick={() => onOpen(group)}
            className="mt-6 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10 md:w-auto md:self-start md:mt-auto"
          >
            Ver
          </button>
        </div>

        {/* MEDIA */}
        <div className="md:col-span-7">
          {!showTwo && (
            <div className={cn("relative", MEDIA_H)}>
              <MediaThumb
                item={
                  forceSingle && videoThumb
                    ? { url: videoThumb.url, thumbnail: posterImage }
                    : {
                        url: thumbs[0]?.url || group.cover?.url,
                        thumbnail: thumbs[0]?.thumbnail || group.cover?.thumbnail,
                      }
                }
                className="h-full w-full"
                showPlayIcon={false}
                onClick={() => onOpen(group)}
              />

              {forceSingle && (
                <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs text-white backdrop-blur md:hidden">
                  video
                </div>
              )}

              {!forceSingle && more > 0 && (
                <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs text-white backdrop-blur">
                  +{more}
                </div>
              )}
            </div>
          )}

          {showTwo && (
            <div className={cn("relative", MEDIA_H)}>
              <div
                className={cn(
                  "relative h-full",
                  "grid gap-1",
                  "pb-px", // ✅ FIX: evita micro-corte abajo
                  stackVertical ? "grid-cols-1 grid-rows-2" : "grid-cols-2"
                )}
              >
                <MediaThumb
                  item={thumbs[0]}
                  className="h-full w-full"
                  showPlayIcon={false}
                  onOrientation={setO1}
                  onClick={() => onOpen(group)}
                />
                <MediaThumb
                  item={thumbs[1]}
                  className="h-full w-full"
                  showPlayIcon={false}
                  onOrientation={setO2}
                  onClick={() => onOpen(group)}
                />

                {more > 0 && (
                  <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs text-white backdrop-blur">
                    +{more}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/** ---------- Section (paginado + modal) ---------- */
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

  const [groups, setGroups] = useState<ProjectApiGroup[]>(
    initialOk ? (initial as any).projects || [] : []
  );
  const [page, setPage] = useState<number>(initialOk ? (initial as any).page || 1 : 1);
  const [totalPages, setTotalPages] = useState<number>(
    initialOk ? (initial as any).totalPages || 1 : 1
  );

  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(
    !initialOk ? (initial as any)?.error || "Error cargando projects" : null
  );

  const canLoadMore = useMemo(() => page < totalPages, [page, totalPages]);

  const [open, setOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<ProjectApiGroup | null>(null);

  const openModal = (g: ProjectApiGroup) => {
    setActiveGroup(g);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setActiveGroup(null);
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

      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (e: any) {
      setError(e?.message || "Error cargando más");
    } finally {
      setLoadingMore(false);
    }
  };

  if (!groups || groups.length === 0) return null;

  return (
    <section id="projects" className="space-y-6 overflow-x-hidden">
      <header className="space-y-2">
        <div
          style={{ fontFamily: "var(--font-thirstycaps)" }}
          className="text-[45px] sm:text-[75px] leading-none italic text-red-600"
        >
          Proyectos
        </div>
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

      {activeGroup && (
        <ProjectModal
          open={open}
          onClose={closeModal}
          album={activeGroup.album}
          title={activeGroup.name || activeGroup.album}
          description={activeGroup.description || ""}
          initialItems={activeGroup.thumbs || []}
        />
      )}
    </section>
  );
}
