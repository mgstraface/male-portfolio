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
      <div className="relative h-[420px] md:h-[520px] bg-gray-100">
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

        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />

        {/* content */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full p-6 md:p-10">
            <div className="text-xs text-white/70">MALE PORTFOLIO</div>
            <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-white">
              Portfolio
            </h1>
            <p className="mt-3 max-w-xl text-white/85">
              Un espacio para mostrar trabajos, sesiones y proyectos.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#contacto"
                className="rounded-xl bg-white px-4 py-2 text-sm text-gray-900 hover:bg-white/90"
              >
                Contacto
              </a>
              <a
                href="#galeria"
                className="rounded-xl border border-white/40 px-4 py-2 text-sm text-white hover:bg-white/10"
              >
                Ver galería
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
