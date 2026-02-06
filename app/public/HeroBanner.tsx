type MediaItem = {
  _id: string;
  title?: string;
  type: "photo" | "video";
  url: string;
  thumbnail?: string;
};




export default function HeroBanner({ item }: { item: MediaItem | null }) {
  return (
    <section className="rounded-3xl border bg-white overflow-hidden">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="p-7 lg:p-10">
          <div className="text-xs text-gray-500">MALE PORTFOLIO</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Portfolio
          </h1>
          <p className="mt-3 text-gray-600">
            Un espacio para mostrar trabajos, sesiones y proyectos.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#contacto"
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
            >
              Contacto
            </a>
            <a
              href="#galeria"
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Ver galería
            </a>
          </div>
        </div>

        <div className="relative min-h-65 lg:min-h-95 bg-gray-100">
          {!item ? (
            <div className="absolute inset-0 grid place-items-center text-sm text-gray-500">
              Subí una foto o video a la categoría <b className="mx-1">Banner</b>
            </div>
          ) : item.type === "photo" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.url}
              alt={item.title || "banner"}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <video
              src={item.url}
              poster={item.thumbnail}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>
      </div>
    </section>
  );
}
