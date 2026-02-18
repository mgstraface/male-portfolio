/* app/public/HeroBanner.tsx */
"use client";

import React from "react";

type MediaItem = {
  _id: string;
  title?: string;
  type: "photo" | "video";
  url: string;
  thumbnail?: string;
};

export default function HeroBanner({ item }: { item: MediaItem | null }) {
  const [showAbout, setShowAbout] = React.useState(false);

  return (
    <section
      className={[
        "relative z-20 overflow-hidden", // ✅ FIX z-index
        "bg-black text-white",
        "min-h-[520px] sm:min-h-[600px] lg:min-h-[640px]",
        "pt-16 sm:pt-20 lg:pt-24",
      ].join(" ")}
    >
      {/* líneas finas decorativas */}
      <div className="absolute left-8 top-6 h-px w-40 bg-white/25" />
      <div className="absolute left-8 top-10 h-px w-56 bg-white/15" />
      <div className="absolute left-6 top-6 h-40 w-px bg-white/15" />

      {/* MALENA gigante */}
      <div className="pointer-events-none absolute inset-x-0 top-16 sm:top-10 lg:top-5 text-center">
        <div
          style={{ fontFamily: "var(--font-miloner)" }}
          className="select-none text-[64px] sm:text-[92px] lg:text-[180px] tracking-tight text-white/90 leading-none"
        >
          MALENA
        </div>
      </div>

      {/* semicírculo rojo */}
      <div
        className={[
          "pointer-events-none absolute left-1/2 -translate-x-1/2",
          "bottom-[-240px] sm:bottom-[-280px] lg:bottom-[-320px]",
          "h-[520px] w-[820px] sm:h-[620px] sm:w-[980px] lg:h-[720px] lg:w-[1120px]",
          "rounded-t-full bg-red-600 opacity-95",
        ].join(" ")}
      />

      {/* media pegada abajo */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center">
        {!item ? (
          <div className="mb-10 rounded-2xl border border-white/15 bg-white/5 px-6 py-5 text-center text-sm text-white/70">
            Subí una <b>imagen PNG</b> (sin fondo) a la categoría <b>Banner</b>.
          </div>
        ) : item.type === "photo" ? (
          <img
            src={item.url}
            alt={item.title || "banner"}
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

      {/* texto derecha (desktop) */}
      <div
        className="
          absolute
          right-[20%]
          top-[28%]
          z-20
          hidden lg:block
          max-w-[320px]
          text-right
        "
      >
        <div
          style={{ fontFamily: "var(--font-thirstycaps)" }}
          className="text-[75px] leading-none italic text-red-600"
        >
          Sobre mí
        </div>

        <p
          style={{ fontFamily: "var(--font-nunito)" }}
          className="mt-3 text-sm leading-relaxed text-white/80"
        >
          Tengo 15 años y Soy de San Genaro - Santa Fe, Argentina.
           Me dedico a la creación visual, programación, a la enseñanza de street dance, 
           con experiencia en proyectos creativos y comerciales, integrando narrativa, versatilidad y una identidad estética, sólida en cada colaboración.
         
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <a
            href="#projects"
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
          >
            Proyectos
          </a>
          <a
            href="#contacto"
            className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
          >
            Contacto
          </a>
        </div>
      </div>

      {/* MOBILE/TABLET menú */}
      <div className="absolute inset-x-0 top-[124px] sm:top-[148px] z-20 px-6 lg:hidden">
        <div className="mx-auto max-w-[520px] text-center">
          <div className="flex items-center justify-center gap-4 text-sm text-white/85">
            <a href="#projects" className="hover:text-white transition">
              Proyectos
            </a>
            <span className="text-white/30">•</span>
            <a href="#contacto" className="hover:text-white transition">
              Contacto
            </a>
            <span className="text-white/30">•</span>
            <button
              type="button"
              onClick={() => setShowAbout((v) => !v)}
              className="hover:text-white transition underline-offset-4"
              style={{ textDecoration: showAbout ? "underline" : "none" }}
            >
              Sobre mí
            </button>
          </div>

          <div
            className={[
              "grid transition-all duration-300 ease-out",
              showAbout ? "grid-rows-[1fr] mt-4" : "grid-rows-[0fr] mt-0",
            ].join(" ")}
          >
            <div className="overflow-hidden">
              <div className="mx-auto max-w-[420px] rounded-1xl border border-white/15 bg-black/35 px-4 py-4 text-sm leading-relaxed text-white/85 backdrop-blur-sm">
               Creadora visual e instructora de street dance, con experiencia en proyectos creativos y comerciales, integrando narrativa, versatilidad y una identidad estética, sólida en cada colaboración.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
