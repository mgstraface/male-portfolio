/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";

type MediaItem = {
  _id: string;
  title?: string;
  type: "photo" | "video";
  url: string;
  thumbnail?: string;
};

export default function MediaCarousel({
  title,
  subtitle,
  items,
  sitting,
}: {
  title: string;
  subtitle?: string;
  items: MediaItem[];
  sitting?: MediaItem | null; // PNG recortada “sentada”
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;

  useEffect(() => {
    if (count === 0) setIndex(0);
    else if (index > count - 1) setIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const canAutoplay = count > 1;

  const next = () => {
    if (count === 0) return;
    setIndex((i) => (i + 1) % count);
  };

  const prev = () => {
    if (count === 0) return;
    setIndex((i) => (i - 1 + count) % count);
  };

  useEffect(() => {
    if (!canAutoplay || paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, 3500);

    return () => window.clearInterval(id);
  }, [paused, canAutoplay, count]);

  return (
    <section
      id="galeria"
      className="
        relative
        rounded-1xl border border-white/10 bg-white/5
        p-5 shadow-2xl
      "
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ✅ Overlay “sentada” */}
      {sitting?.url ? (
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            right-[190] top-0
            z-30
          "
          style={
            {
              // 🔥 Corrimiento horizontal por breakpoint (default = mobile)
              // mobile (<640): más a la derecha
              ["--sx" as any]: "90px",
              // desktop (>=768): un poco menos
              // si querés más derecha en desktop, subí este valor
              // (se aplica porque md redefine la variable)
            } as React.CSSProperties
          }
        >
          {/* redefino --sx en md con Tailwind (sin tocar style) */}
          <div className="md:[--sx:140px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sitting.url}
              alt={sitting.title || "sentada"}
              loading="lazy"
              className="
                select-none
                drop-shadow-[0_22px_40px_rgba(0,0,0,0.55)]
                w-[350px] sm:w-[350px] md:w-[350px] lg:w-[500px]
                -translate-y-[-50%] sm:-translate-y-6 md:-translate-y-[22%] md:-translate-x-[-45%]
              "
              style={{
                // ✅ ACÁ estaba tu bug: era --sx2. Tiene que ser --sx.
                transform: "translateX(calc(-50% + var(--sx)))",
              }}
            />

            {/* sombra suave (apoyo) */}
            <div
              className="
                absolute left-1/2 -translate-x-1/2
                -bottom-2
                h-10 w-[75%]
                rounded-full
                bg-black/35 blur-2xl
              "
            />
          </div>
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-4">
        {/* <div>
          <div className="text-xs tracking-widest text-white/40 uppercase">Galería</div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-white/60">{subtitle}</p> : null}
        </div> */}

         <div 
        style={{ fontFamily: "var(--font-thirstycaps)" }} 
        className="text-[75px] leading-none  italic text-red-600">
          Destacadas
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            disabled={count <= 1}
            className="
              rounded-xl border border-white/15 bg-black/40
              px-3 py-2 text-sm text-white
              hover:bg-white/10
              disabled:opacity-40 disabled:cursor-not-allowed
            "
            type="button"
            aria-label="Anterior"
            title="Anterior"
          >
            ←
          </button>
          <button
            onClick={next}
            disabled={count <= 1}
            className="
              rounded-xl border border-white/15 bg-black/40
              px-3 py-2 text-sm text-white
              hover:bg-white/10
              disabled:opacity-40 disabled:cursor-not-allowed
            "
            type="button"
            aria-label="Siguiente"
            title="Siguiente"
          >
            →
          </button>
        </div>
      </div>

      {count === 0 ? (
        <p className="mt-4 text-sm text-white/60">No hay fotos para mostrar todavía.</p>
      ) : (
        <>
          {/* VIEWPORT */}
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {items.map((m) => (
                <div key={m._id} className="w-full shrink-0">
                  <div className="relative h-[360px] sm:h-[420px] md:h-[520px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.url}
                      alt={m.title || "foto"}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />

                    {m.title ? (
                      <div className="absolute bottom-0 left-0 right-0 px-4 py-4">
                        <div className="text-sm text-white/90">{m.title}</div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {count > 1 && (
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    type="button"
                    aria-label={`Ir a ${i + 1}`}
                    className={`
                      h-2.5 w-2.5 rounded-full transition
                      ${i === index ? "bg-white" : "bg-white/25 hover:bg-white/40"}
                    `}
                  />
                ))}
              </div>

              <div className="text-xs text-white/50">
                Autoplay {paused ? "(pausado)" : "(activo)"}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
