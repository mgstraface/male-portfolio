"use client";

import { useMemo, useRef } from "react";

type MediaItem = {
  _id: string;
  title?: string;
  url: string;
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
  const ref = useRef<HTMLDivElement | null>(null);

  const canRender = useMemo(() => items && items.length > 0, [items]);

  const scrollByCards = (dir: "left" | "right") => {
    const el = ref.current;
    if (!el) return;
    const amount = Math.max(280, Math.floor(el.clientWidth * 0.8));
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section id="galeria" className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-gray-600">{subtitle}</p> : null}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => scrollByCards("left")}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            type="button"
          >
            ←
          </button>
          <button
            onClick={() => scrollByCards("right")}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            type="button"
          >
            →
          </button>
        </div>
      </div>

      <div className="rounded-3xl border bg-white p-4">
        {!canRender ? (
          <div className="rounded-2xl border bg-gray-50 p-6 text-sm text-gray-600">
            Subí fotos a la categoría <b>Carousel</b> para que aparezcan acá.
          </div>
        ) : (
          <div
            ref={ref}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
            style={{ scrollbarWidth: "thin" }}
          >
            {items.map((m) => (
              <div
                key={m._id}
                className="snap-start shrink-0 w-[240px] sm:w-[300px] lg:w-[340px]"
              >
                <div className="rounded-2xl border overflow-hidden bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.title || "media"} className="h-[320px] w-full object-cover" />
                </div>
                <div className="mt-2 text-sm font-medium">
                  {m.title || "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
