/* app/public/HeroBanner.tsx */
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
      <div className="grid items-center gap-8 lg:grid-cols-2 p-6 sm:p-8 lg:p-10">
        {/* IZQUIERDA: TEXTO */}
        <div className="order-2 lg:order-1">
          <div className="text-xs text-gray-500 tracking-wide">MALE PORTFOLIO</div>

          <h1 className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight">
            Portfolio
          </h1>

          <p className="mt-4 text-gray-600 max-w-xl">
            Un espacio para mostrar trabajos, sesiones y proyectos.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#contacto"
              className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm text-white hover:bg-gray-800"
            >
              Contacto
            </a>

            <a
              href="#galeria"
              className="rounded-xl border px-5 py-2.5 text-sm hover:bg-gray-50"
            >
              Ver galería
            </a>
          </div>
        </div>

        {/* DERECHA: MEDIA EN “BLOB” */}
        <div className="order-1 lg:order-2">
          {/* Definimos el clipPath una sola vez */}
          <svg width="0" height="0" className="absolute">
            <defs>
              {/* blob “tipo mancha” */}
              <clipPath id="blobClip" clipPathUnits="objectBoundingBox">
                <path d="M0.86,0.08 C0.95,0.17,1,0.32,0.98,0.47 C0.96,0.63,0.87,0.79,0.72,0.89 C0.57,0.99,0.37,1.02,0.21,0.93 C0.06,0.83,0,0.62,0.02,0.43 C0.04,0.24,0.13,0.06,0.29,0.02 C0.45,-0.02,0.77,-0.01,0.86,0.08 Z" />
              </clipPath>
            </defs>
          </svg>

          <div className="relative w-full">
            <div
              className="relative w-full bg-gray-100 overflow-hidden shadow-sm"
              style={{
                clipPath: "url(#blobClip)",
                WebkitClipPath: "url(#blobClip)",
              }}
            >
              {/* alto “ref” */}
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] bg-gray-100">
                {!item ? (
                  <div className="absolute inset-0 grid place-items-center text-sm text-gray-500 px-6 text-center">
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

            {/* Detallito “pill” arriba a la izquierda (como ref) */}
            <div className="absolute -top-3 left-4 rounded-full border bg-white/90 px-3 py-1 text-xs text-gray-700 shadow-sm">
              Bienvenido
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
