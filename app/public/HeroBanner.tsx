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
    <section
      className={[
        "relative overflow-hidden",
        "rounded-3xl", // si lo querés recto: sacalo.
        "bg-black text-white",
        "min-h-[520px] sm:min-h-[600px] lg:min-h-[640px]",
        // espacio arriba para que PORTFOLIO no se coma la imagen
        "pt-16 sm:pt-20 lg:pt-24",
      ].join(" ")}
    >
      {/* líneas finas arriba (como la ref) */}
      <div className="absolute left-8 top-6 h-px w-40 bg-white/25" />
      <div className="absolute left-8 top-10 h-px w-56 bg-white/15" />
      <div className="absolute left-6 top-6 h-40 w-px bg-white/15" />

      {/* PORTFOLIO gigante atrás */}
      <div className="pointer-events-none absolute inset-x-0 top-10 text-center">
        <div className="select-none text-[64px] sm:text-[92px] lg:text-[120px] font-black tracking-tight text-white/90 leading-none">
          MALENA
        </div>
      </div>

      {/* Semicírculo ROJO (abajo) */}
      <div
        className={[
          "pointer-events-none absolute left-1/2 -translate-x-1/2",
          "bottom-[-240px] sm:bottom-[-280px] lg:bottom-[-320px]",
          "h-[520px] w-[820px] sm:h-[620px] sm:w-[980px] lg:h-[720px] lg:w-[1120px]",
          "rounded-t-full bg-red-600",
          "opacity-95",
        ].join(" ")}
      />

      {/* MEDIA: pegada abajo como la referencia */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center">
        {!item ? (
          <div className="mb-10 rounded-2xl border border-white/15 bg-white/5 px-6 py-5 text-center text-sm text-white/70">
            Subí una <b>imagen PNG</b> (sin fondo) a la categoría <b>Banner</b>.
          </div>
        ) : item.type === "photo" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt={item.title || "banner"}
            className={[
              "block",
              // 👇 clave: bottom pegado + tamaño “tipo poster”
              "h-[440px] sm:h-[520px] lg:h-[600px]",
              "w-auto",
              // un poco más grande y con límite para que no explote en desktop
              "max-w-[92vw] lg:max-w-[720px]",
              "object-contain object-bottom",
              "drop-shadow-[0_28px_55px_rgba(0,0,0,0.65)]",
              // le damos un toque de aire abajo como en la ref
              "translate-y-[6px]",
            ].join(" ")}
          />
        ) : (
          <video
            src={item.url}
            poster={item.thumbnail}
            autoPlay
            muted
            loop
            playsInline
            className={[
              "block",
              "h-[440px] sm:h-[520px] lg:h-[600px]",
              "w-auto",
              "max-w-[92vw] lg:max-w-[720px]",
              "object-contain object-bottom",
              "drop-shadow-[0_28px_55px_rgba(0,0,0,0.65)]",
              "translate-y-[6px]",
            ].join(" ")}
          />
        )}
      </div>

      {/* texto a la derecha (como ref) */}
      <div className="absolute right-8 top-28 z-20 hidden lg:block max-w-[320px] text-right">
        <div className="text-[44px] leading-none font-semibold italic text-red-600">
          Male
        </div>

        <p className="mt-3 text-sm leading-relaxed text-white/80">
          I am a freelance model with experience in creative, lifestyle, and commercial
          projects. I bring versatility, professionalism, and a strong visual presence
          to every collaboration.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <a
            href="#projects"
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
          >
            Projects
          </a>
          <a
            href="#contacto"
            className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
          >
            Contacto
          </a>
        </div>
      </div>

      {/* versión mobile/tablet: texto abajo */}
      <div className="relative z-20 px-6 pb-8 lg:hidden">
        <div className="text-center">
          <div className="text-[40px] font-black tracking-tight text-white/95 leading-none">
            PORTFOLIO
          </div>
          <p className="mt-3 text-sm text-white/75">
            Creative / lifestyle / commercial. Proyectos seleccionados.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <a
              href="#projects"
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
            >
              Projects
            </a>
            <a
              href="#contacto"
              className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
            >
              Contacto
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
