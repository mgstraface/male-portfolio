/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import ContactForm from "./ContactForm";

type MediaItem = {
  _id: string;
  title?: string;
  type: "photo" | "video";
  url: string;
  thumbnail?: string;
};

export default function ContactSection({
  sittingContact,
  trainingTitle = "Más formación",
  trainingIntro,
  trainingItems = [],
}: {
  sittingContact?: MediaItem | null;
  trainingTitle?: string;
  trainingIntro?: string;
  trainingItems?: string[];
}) {
  const [openBio, setOpenBio] = useState(false);

  // ✅ pulse SOLO para el label (CLICK HERE + flecha)
  const [pulseHint, setPulseHint] = useState(false);

  const canOpenBio = Boolean(trainingIntro) || (trainingItems?.length ?? 0) > 0;

  useEffect(() => {
    if (!canOpenBio) return;
    const id = window.setInterval(() => setPulseHint((v) => !v), 1400);
    return () => window.clearInterval(id);
  }, [canOpenBio]);

  // ✅ Cerrar modal con ESC
  useEffect(() => {
    if (!openBio) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenBio(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openBio]);

  return (
    <section id="contacto" className="relative space-y-4">
      <div>
        <div
          style={{ fontFamily: "var(--font-thirstycaps)" }}
          className="text-[45px] sm:text-[75px] leading-none italic text-red-600"
        >
          Contacto
        </div>
        <p className="mt-1 text-sm text-white/60">Dejá tu mensaje o consulta.</p>
      </div>

      <div className="relative overflow-visible">
        {/* ✅ Overlay “sentada” (click SOLO en la imagen) */}
        {sittingContact?.url ? (
          <div
            aria-hidden="true"
            className="absolute right-0 -top-8 sm:-top-10 md:-top-12 z-30 pointer-events-none"
            style={
              {
                // Ajustá si querés moverla fino:
                // negativo = hacia adentro (a la izquierda), positivo = hacia afuera
                ["--sx" as any]: "-40px", // mobile
              } as React.CSSProperties
            }
          >
            {/* redefino --sx por breakpoint */}
            <div className="sm:[--sx:-55px] md:[--sx:-70px] lg:[--sx:-95px]">
              <div className="relative w-fit pointer-events-auto" style={{ transform: "translateX(var(--sx))" }}>
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
                  {/* IMG (✅ ESTÁTICA) */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sittingContact.url}
                    alt={sittingContact.title || "sentada"}
                    loading="lazy"
                    className={`
                      relative left-1/2
                      select-none
                      drop-shadow-[0_22px_40px_rgba(0,0,0,0.55)]
                      w-[150px] sm:w-[350px] md:w-[350px] lg:w-[230px]
                      -translate-y-8 sm:-translate-y-[18%] md:-translate-y-[45%]
                      md:-translate-x-[80%] -translate-x-[25%] -translate-y-[44%]
                    `}
                  />

                  {/* LABEL: CLICK HERE + flecha curvada con pulse */}
                  {canOpenBio ? (
                    <div
                      className="
                        pointer-events-none
                        absolute z-20
                        left-1/2
                        -translate-x-1/2
                        select-none
                        opacity-95
                      "
                      style={{ fontFamily: "var(--font-thirstycaps)" }}
                    >
                      <div
                        className="
                          absolute
                          -translate-y-[800%] sm:-translate-y-[35%] md:-translate-y-[1080%]
                          md:-translate-x-[180%] -translate-x-[75%]
                          w-max
                          flex items-center gap-2
                        "
                      >
                        {/* Cartel */}
                        <div
                          className={`
                            text-white
                            italic leading-none
                            drop-shadow-[0_14px_24px_rgba(0,0,0,0.65)]
                            bg-black/25
                            
                            rounded-md
                            px-2.5 py-1.5
                            transition-transform duration-700 ease-in-out
                            ${pulseHint ? "scale-[1.08]" : "scale-[1.0]"}
                          `}
                        >
                          <span className="text-[18px] sm:text-[22px] md:text-[24px]">CLICK HERE</span>
                        </div>

                        {/* Flecha curvada (blanca) */}
                        <div
                          className={`
                            transition-transform duration-700 ease-in-out
                            ${pulseHint ? "translate-x-1 -translate-y-0.5" : "translate-x-0 translate-y-0"}
                          `}
                          aria-hidden
                        >
                          {/* SVG: flecha curvada con onda */}
                          <svg
                            width="46"
                            height="34"
                            viewBox="0 0 46 34"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="drop-shadow-[0_10px_18px_rgba(0,0,0,0.55)]"
                          >
                            {/* curva */}
                            <path
                              d="M2 8 C 14 2, 22 2, 28 10 C 33 16, 34 22, 30 28"
                              stroke="white"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                            />
                            {/* mini onda */}
                            <path
                              d="M20 6 C 22 4.5, 24 4.5, 26 6"
                              stroke="white"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              opacity="0.9"
                            />
                            {/* punta */}
                            <path
                              d="M30 28 L36 26 L33 32"
                              stroke="white"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <span className="sr-only">Más info sobre mí</span>
                </button>

                {/* sombra suave (apoyo) */}
                <div
                  className="
                    pointer-events-none
                    absolute left-1/2 -translate-x-1/2
                    bottom-1
                    h-8 w-[72%]
                    rounded-full
                    bg-black/35 blur-2xl
                  "
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* ✅ Card full width */}
        <div className="rounded-1xl border border-white/10 bg-white/5 p-6 shadow-2xl">
          <ContactForm />
        </div>
      </div>

      {/* ✅ MODAL Formación */}
      {openBio ? (
        <div
          className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={trainingTitle}
        >
          {/* overlay */}
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            onClick={() => setOpenBio(false)}
            aria-label="Cerrar"
          />

          {/* panel */}
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
                className="
                  rounded-xl border border-white/15 bg-white/5
                  px-3 py-2 text-sm text-white
                  hover:bg-white/10
                "
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
                className="
                  rounded-xl border border-white/15 bg-white/5
                  px-4 py-2 text-sm text-white
                  hover:bg-white/10
                "
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
