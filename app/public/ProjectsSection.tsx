/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";

type MediaItem = {
  _id: string;
  title?: string;
  name?: string;
  description?: string;
  type: "photo" | "video";
  url: string;
  thumbnail?: string;
  isFeatured: boolean;
  fullVideoUrl?: string; // lo usamos como link externo
};

export default function ProjectsSection({
  title = "Projects",
  subtitle = "",
  items,
}: {
  title?: string;
  subtitle?: string;
  items: MediaItem[];
}) {
  return (
    <section id="projects" className="rounded-3xl border bg-white p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-gray-600">{subtitle}</p> : null}
        </div>

        <Link
          href="#contacto"
          className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
        >
          Contacto
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-gray-600">
          Todavía no hay proyectos. Creá una categoría <b>Projects</b> y subí contenido.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => {
            const titleText = (p.name || p.title || "(sin título)").trim();
            const desc = (p.description || "").trim();
            const cover = p.type === "video" ? (p.thumbnail || p.url) : p.url;

            return (
              <article key={p._id} className="rounded-2xl border bg-white overflow-hidden">
                <div className="relative h-44 w-full bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cover}
                    alt={titleText}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {p.type === "video" && (
                    <div className="absolute left-3 top-3 rounded-full bg-black/70 px-2 py-1 text-[11px] text-white">
                      Video
                    </div>
                  )}
                  {p.isFeatured && (
                    <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[11px]">
                      ⭐ Destacado
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="text-sm font-semibold">{titleText}</div>
                  {desc ? (
                    <p className="mt-1 text-sm text-gray-600 line-clamp-3">{desc}</p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-400">Sin descripción</p>
                  )}

                  <div className="mt-4 flex items-center gap-2">
                    {p.fullVideoUrl ? (
                      <a
                        href={p.fullVideoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800"
                      >
                        Ver
                      </a>
                    ) : (
                      <a
                        href="#galeria"
                        className="rounded-xl bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800"
                      >
                        Ver galería
                      </a>
                    )}

                    <a
                      href="#contacto"
                      className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      Consultar
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
