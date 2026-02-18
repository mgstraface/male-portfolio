/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";

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
  trainingTitle = "Formación",
  trainingIntro,
  trainingItems = [],
}: {
  title: string;
  subtitle?: string;
  items: MediaItem[];
  sitting?: MediaItem | null;
  trainingTitle?: string;
  trainingIntro?: string;
  trainingItems?: string[];
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [openBio, setOpenBio] = useState(false);

  const [pulseZoom, setPulseZoom] = useState(false);

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

  useEffect(() => {
    if (!openBio) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenBio(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openBio]);

  const canOpenBio = Boolean(trainingIntro) || (trainingItems?.length ?? 0) > 0;

  useEffect(() => {
    if (!canOpenBio) return;
    const id = window.setInterval(() => setPulseZoom((v) => !v), 1700);
    return () => window.clearInterval(id);
  }, [canOpenBio]);

  return (
    <section
      id="galeria"
      className="
        relative z-[60]
        overflow-visible
        rounded-1xl border border-white/10
        p-5 shadow-2xl
        -mt-10 sm:-mt-14 md:-mt-16 lg:mt-0
      "
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Sentada */}
      {sitting?.url ? (
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 z-10 pointer-events-none"
          style={{ ["--sx" as any]: "55px" } as React.CSSProperties}
        >
          <div className="sm:[--sx:85px] md:[--sx:140px] lg:[--sx:190px]">
            <button
              type="button"
              disabled={!canOpenBio}
              onClick={() => canOpenBio && setOpenBio(true)}
              className={`
                pointer-events-auto
                focus:outline-none
                relative
                ${canOpenBio ? "cursor-pointer" : "cursor-default"}
              `}
              aria-label={canOpenBio ? "Más info sobre mí" : "Imagen decorativa"}
              title={canOpenBio ? "Más info sobre mí" : undefined}
            >
              {/* IMG */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sitting.url}
                alt={sitting.title || "sentada"}
                loading="lazy"
                className={`
                  relative left-1/2
                  select-none
                  drop-shadow-[0_22px_40px_rgba(0,0,0,0.55)]
                  w-[150px] sm:w-[350px] md:w-[350px] lg:w-[230px]
                  -translate-y-8 sm:-translate-y-[35%] md:-translate-y-[18%] md:-translate-x-[120%] -translate-x-[48%]
                  transition-transform duration-[900ms] ease-in-out
                  ${canOpenBio ? "hover:scale-[1.07]" : ""}
                  ${canOpenBio && pulseZoom ? "scale-[1.07]" : ""}
                `}
              />

              {/* TEXTO encima / “entre las piernas” */}
              {canOpenBio ? (
                <div
                  className="
                    pointer-events-none
                    absolute z-20
                    left-1/2
                    -translate-x-1/2
                    text-red-600
                    italic leading-none
                    text-center
                    select-none
                    drop-shadow-[0_14px_24px_rgba(0,0,0,0.65)]
                    opacity-95
                  "
                  style={{ fontFamily: "var(--font-thirstycaps)" }}
                >
                  <div
                    className="
                      absolute
                     -translate-y-[450%]  sm:-translate-y-[35%] md:-translate-y-[620%] md:-translate-x-[245%] -translate-x-[57%]
                      w-max
                    "
                  >
                    <div style={{backgroundColor:"#0000002f", borderRadius:"5px"}} className="text-[20px] sm:text-[24px] md:text-[26px]">
                      MÁS SOBRE MÍ
                    </div>
                    {/* <div className="text-[16px] sm:text-[20px] md:text-[22px] -mt-1">
                      SOBRE MÍ
                    </div> */}
                  </div>
                </div>
              ) : null}

              <span className="sr-only">Más info sobre mí</span>
            </button>

            {/* sombra */}
            <div
              className="
                pointer-events-none
                absolute left-1/2 -translate-x-1/2
                -bottom-2
                h-10 w-[75%]
                rounded-full
                bg-black/35 blur-2xl
                z-0
              "
            />
          </div>
        </div>
      ) : null}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div
          style={{ fontFamily: "var(--font-thirstycaps)" }}
          className="text-[45px] sm:text-[75px] leading-none italic text-red-600"
        >
          Destacadas
        </div>
      </div>

      {count === 0 ? (
        <p className="mt-4 text-sm text-white/60">No hay fotos para mostrar todavía.</p>
      ) : (
        <>
          <div
            className="
              mt-4
              overflow-hidden
              border border-white/10
              bg-black
              w-screen
              relative left-1/2 -translate-x-1/2
              sm:w-full sm:left-auto sm:translate-x-0
            "
          >
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {items.map((m) => (
                <div key={m._id} className="w-full shrink-0">
                  <div className="relative h-[380px] sm:h-[460px] md:h-[620px] lg:h-[700px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.url}
                      alt={m.title || "foto"}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {count > 1 && (
            <div className="mt-3 flex flex-col gap-3">
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={prev}
                  className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white hover:bg-white/10"
                  type="button"
                  aria-label="Anterior"
                  title="Anterior"
                >
                  ←
                </button>
                <button
                  onClick={next}
                  className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white hover:bg-white/10"
                  type="button"
                  aria-label="Siguiente"
                  title="Siguiente"
                >
                  →
                </button>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {items.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      type="button"
                      aria-label={`Ir a ${i + 1}`}
                      className={`h-2.5 w-2.5 rounded-full transition ${
                        i === index ? "bg-white" : "bg-white/25 hover:bg-white/40"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-white/50">Autoplay {paused ? "(pausado)" : "(activo)"}</div>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL */}
      {openBio ? (
        <div
          className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={trainingTitle}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            onClick={() => setOpenBio(false)}
            aria-label="Cerrar"
          />

          <div
            className="
              relative z-[1000]
              w-full sm:w-[640px]
              rounded-t-3xl sm:rounded-3xl
              border border-white/15
              bg-black/90
              shadow-2xl
              p-5 sm:p-6
              text-white
            "
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs tracking-widest text-white/50 uppercase">Sobre mí</div>
                <h3 className="mt-1 text-xl sm:text-2xl font-semibold">{trainingTitle}</h3>
              </div>

              <button
                type="button"
                onClick={() => setOpenBio(false)}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
                aria-label="Cerrar"
                title="Cerrar"
              >
                ✕
              </button>
            </div>

            {trainingIntro ? <p className="mt-4 text-sm text-white/80 leading-relaxed">{trainingIntro}</p> : null}

            {trainingItems?.length ? (
              <ul className="mt-4 space-y-2 text-sm text-white/85 list-disc pl-5">
                {trainingItems.map((it, idx) => (
                  <li key={`${it}-${idx}`}>{it}</li>
                ))}
              </ul>
            ) : null}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setOpenBio(false)}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
