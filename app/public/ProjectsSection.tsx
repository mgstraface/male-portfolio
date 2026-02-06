/* app/public/ProjectsSection.tsx */
type MediaItem = {
  _id: string;
  type: "photo" | "video";
  url: string;
  thumbnail?: string;

  // NUEVO (para projects)
  name?: string;
  description?: string;
  fullVideoUrl?: string;

  // fallback si no usás name
  title?: string;
};

export default function ProjectsSection({ items }: { items: MediaItem[] }) {
  if (!items || items.length === 0) {
    return (
      <section className="rounded-3xl border bg-white p-6">
        <h2 className="text-2xl font-semibold">Projects</h2>
        <p className="mt-2 text-sm text-gray-600">
          Creá una categoría <b>Projects</b> y cargá items para que aparezcan acá.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border bg-white p-6 sm:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Projects</h2>
          <p className="mt-2 text-sm text-gray-600">
            Una selección de trabajos y proyectos destacados.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {items.map((p, idx) => {
          const title = (p.name || p.title || "Project").trim();
          const desc = (p.description || "").trim();
          const reverse = idx % 2 === 1;

          return (
            <article
              key={p._id}
              className={`grid gap-5 rounded-3xl border bg-white overflow-hidden lg:grid-cols-2 ${
                reverse ? "lg:[&>div:first-child]:order-2" : ""
              }`}
            >
              {/* Media */}
              <div className="relative bg-gray-100">
                <div className="relative w-full aspect-[16/10] sm:aspect-[16/9]">
                  {p.type === "photo" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.url}
                      alt={title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <video
                      src={p.url}
                      poster={p.thumbnail}
                      controls
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                </div>
              </div>

              {/* Texto */}
              <div className="p-6 sm:p-8 flex flex-col justify-center">
                <div className="text-xs text-gray-500">PROJECT</div>
                <h3 className="mt-2 text-xl sm:text-2xl font-semibold">{title}</h3>

                {desc ? (
                  <p className="mt-3 text-gray-600 leading-relaxed">{desc}</p>
                ) : (
                  <p className="mt-3 text-gray-500">
                    Agregá <b>description</b> para que quede como la referencia.
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  {p.fullVideoUrl ? (
                    <a
                      href={p.fullVideoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
                    >
                      Ver proyecto
                    </a>
                  ) : (
                    <span className="rounded-xl border px-4 py-2 text-sm text-gray-600">
                      (sin link)
                    </span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
