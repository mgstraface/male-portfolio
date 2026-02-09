/* app/public/ProjectsSection.tsx */
/* eslint-disable @next/next/no-img-element */
"use client";

type ProjectMediaItem = {
  _id: string;
  title?: string;
  album?: string | null;
  name?: string;
  description?: string;

  type?: "photo" | "video";
  url: string;
  thumbnail?: string;
  fullVideoUrl?: string;
};

type ProjectGroup = {
  key: string;
  album: string | null;
  count: number;
  types?: Array<"photo" | "video">;
  lastCreatedAt?: string;
  cover?: ProjectMediaItem;
  items: ProjectMediaItem[];
};

function getGroupTitle(g: ProjectGroup) {
  return (
    g.album ||
    g.cover?.name ||
    g.cover?.title ||
    g.items?.[0]?.name ||
    g.items?.[0]?.title ||
    "Proyecto"
  );
}


function getGroupDesc(g: ProjectGroup) {
  return g.cover?.description || g.items?.[0]?.description || "";
}

function MediaThumb({
  item,
  className = "",
  showPlay = false,
}: {
  item: ProjectMediaItem;
  className?: string;
  showPlay?: boolean;
}) {
  const isVideo = item.type === "video" || (!!item.thumbnail && !item.url.match(/\.(jpg|jpeg|png|webp)$/i));
  const thumb = isVideo ? item.thumbnail || item.url : item.url;

  return (
    <div
      className={[
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5",
        "transition-transform duration-300 will-change-transform",
        "hover:scale-[1.03]",
        className,
      ].join(" ")}
    >
      <img
        src={thumb}
        alt={item.name || item.title || "media"}
        className={[
          "h-full w-full object-cover",
          "transition duration-300 will-change-transform",
          // ✅ BN default + hover color
          "filter grayscale contrast-125 brightness-90",
          "group-hover:grayscale-0 group-hover:brightness-100",
        ].join(" ")}
        loading="lazy"
      />

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
              <path
                d="M9 18V6l10 6-10 6Z"
                fill="white"
                opacity="0.95"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectCard({
  group,
  index,
}: {
  group: ProjectGroup;
  index: number;
}) {
  const isFirst = index === 0;
  const bg = isFirst ? "bg-[#C81D25]" : "bg-black"; // rojo / negro
  const title = getGroupTitle(group);
  const desc = getGroupDesc(group);

  const items = group.items || [];
  const count = items.length;
console.log(group)
  // si hay más de 1 => mostramos 2 thumbs
  const showTwo = count >= 2;
  const preview = showTwo ? items.slice(0, 2) : items.slice(0, 1);
  const only = preview[0];

  const more = Math.max(0, count - preview.length);

  const isVideoOnly =
    count === 1 && (only?.type === "video" || !!only?.thumbnail);

  return (
    <article
      className={[
        "rounded-[28px] border border-white/10",
        bg,
        "p-6 md:p-8",
      ].join(" ")}
    >
      <div className="grid items-start gap-6 md:grid-cols-12">
        {/* TEXTO */}
        <div className="md:col-span-5">
          <div className="text-[11px] tracking-widest text-white/60 uppercase">
            Project
          </div>

          <h3 className="mt-2 text-2xl md:text-[28px] font-semibold tracking-tight text-white">
            {title}
          </h3>

          {desc ? (
            <p className="mt-3 text-white/75 leading-relaxed">
              {desc}
            </p>
          ) : (
            <p className="mt-3 text-white/55 leading-relaxed">
              {/* por si no cargaron descripción */}
              Proyecto sin descripción.
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
              {count} {count === 1 ? "archivo" : "archivos"}
            </span>

            {group.types?.length ? (
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
                {group.types.includes("video") && group.types.includes("photo")
                  ? "Foto + Video"
                  : group.types.includes("video")
                    ? "Video"
                    : "Foto"}
              </span>
            ) : null}

            {/* Esto lo vamos a usar después para abrir dialog/galería */}
            <a
              href="#projects"
              className="ml-auto rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15 border border-white/10"
            >
              Ver
            </a>
          </div>
        </div>

        {/* MEDIA */}
        <div className="md:col-span-7">
          {/* SINGLE grande */}
          {!showTwo && only && (
            <div className="relative">
              <MediaThumb
                item={only}
                showPlay={isVideoOnly}
                className="h-[260px] md:h-[340px]"
              />
            </div>
          )}

          {/* DOBLE preview */}
          {showTwo && (
            <div className="relative grid grid-cols-2 gap-4">
              <MediaThumb
                item={preview[0]}
                className="h-[200px] md:h-[260px]"
                showPlay={preview[0].type === "video" || !!preview[0].thumbnail}
              />
              <MediaThumb
                item={preview[1]}
                className="h-[200px] md:h-[260px]"
                showPlay={preview[1].type === "video" || !!preview[1].thumbnail}
              />

              {/* badge +N */}
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
  items,
  title = "Projects",
  subtitle = "Selección de proyectos y sesiones",
}: {
  items: ProjectGroup[];
  title?: string;
  subtitle?: string;
}) {
  if (!items || items.length === 0) return null;

  return (
    <section id="projects" className="space-y-6">
      <header className="space-y-2">
        <div className="text-xs tracking-widest text-white/40 uppercase">
          {title}
        </div>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
          {subtitle}
        </h2>
      </header>

      <div className="grid gap-6 md:grid-cols-2">

        {items.map((g, i) => (
          <ProjectCard key={g.key || String(i)} group={g} index={i} />
        ))}
      </div>
    </section>
  );
}
