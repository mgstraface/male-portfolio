"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
}: {
  title: string;
  subtitle?: string;
  items: MediaItem[];
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;

  // Mantener index válido si cambia el listado
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

  // ✅ Autoplay real (cambia index)
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
    className="rounded-3xl border bg-white p-5"
    onMouseEnter={() => setPaused(true)}
    onMouseLeave={() => setPaused(false)}
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={prev}
          disabled={count <= 1}
          className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          ←
        </button>
        <button
          onClick={next}
          disabled={count <= 1}
          className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          →
        </button>
      </div>
    </div>

    {count === 0 ? (
      <p className="mt-4 text-sm text-gray-600">
        No hay fotos para mostrar todavía.
      </p>
    ) : (
      <>
        {/* 🔥 VIEWPORT SIN BORDE NI PADDING */}
        <div className="mt-4 overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {items.map((m) => (
              <div key={m._id} className="w-full shrink-0">
                {/* ALTURA CONTROLADA */}
                <div className="relative h-[420px] md:h-[520px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.url}
                    alt={m.title || "foto"}
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                  {/* OPCIONAL: overlay con título */}
                  {m.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-4 py-3 text-white text-sm">
                      {m.title}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DOTS + AUTOPLAY */}
        {count > 1 && (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-2 w-2 rounded-full ${
                    i === index ? "bg-gray-900" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <div className="text-xs text-gray-500">
              Autoplay {paused ? "(pausado)" : "(activo)"}
            </div>
          </div>
        )}
      </>
    )}
  </section>
);

}
