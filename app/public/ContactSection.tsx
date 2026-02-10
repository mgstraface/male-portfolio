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

  const canOpenBio = Boolean(trainingIntro) || (trainingItems?.length ?? 0) > 0;

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
        {/* ✅ Overlay “sentada” (hover/click SOLO en la imagen) */}
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
              <div
                className="relative w-fit pointer-events-auto"
                style={{ transform: "translateX(var(--sx))" }}
              >
                <button
                  type="button"
                  disabled={!canOpenBio}
                  onClick={() => canOpenBio && setOpenBio(true)}
                  className={`
                    block focus:outline-none
                    ${canOpenBio ? "cursor-pointer" : "cursor-default"}
                  `}
                  aria-label={canOpenBio ? "Ver más formación" : "Imagen decorativa"}
                  title={canOpenBio ? "Ver más formación" : undefined}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sittingContact.url}
                    alt={sittingContact.title || "sentada contacto"}
                    loading="lazy"
                    className={`
                      select-none
                      drop-shadow-[0_22px_40px_rgba(0,0,0,0.55)]
                      w-[180px] sm:w-[260px] md:w-[200px] lg:w-[230px]
                      translate-y-[-48%] sm:translate-y-[-45%] md:translate-y-[-42%] lg:translate-y-[-45%]
                      transition-transform duration-200 ease-out
                      ${canOpenBio ? "hover:scale-[1.04]" : ""}
                    `}
                  />
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

            {trainingIntro ? (
              <p className="mt-4 text-sm text-white/80 leading-relaxed">{trainingIntro}</p>
            ) : null}

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
