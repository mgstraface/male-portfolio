/* app/public/FooterSection.tsx */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useMemo, useRef, useState } from "react";

type FooterItem = {
  _id?: string;
  url: string;
  title?: string;
};

function cn(...arr: Array<string | false | undefined | null>) {
  return arr.filter(Boolean).join(" ");
}

export default function FooterSection({
  items,
  phone,
  instagramUrl,
  tiktokUrl,
  youtubeUrl,
}: {
  items: FooterItem[];
  phone: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
}) {
  const stack = (items || []).filter(Boolean).slice(0, 4);

  return (
    <footer className="relative mt-24 border-t border-white/10 bg-black">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid items-center gap-10 md:grid-cols-12">
          {/* IZQUIERDA – STACK DE POLAROIDS */}
          <div className="md:col-span-5 flex justify-center md:justify-start">
            {stack.length > 0 ? (
              <PolaroidStack items={stack} />
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-sm text-white/60">
                No hay imágenes cargadas en la categoría <b>footer</b>
              </div>
            )}
          </div>

          {/* DERECHA – INFO */}
          <div className="md:col-span-7 text-white">
            <p className="text-xs tracking-widest uppercase text-white/40">
              Contacto
            </p>

            <h3
              className="mt-2 text-[20px] font-semibold sm:text-[35px]"
              style={{ display: "flex", alignItems: "center", gap: "1rem" }}
            >
              ¿Querés comunicarte con{" "}
              <span
                style={{ fontFamily: "var(--font-thirstycaps)", fontWeight: 400 }}
                className="text-[55px] leading-none italic text-red-600 sm:text-[75px]"
              >
                Malena
              </span>
              ?
            </h3>

            <p className="mt-4 max-w-xl text-white/70">
              Por tratarse de una artista menor de edad, el contacto se realiza
              exclusivamente a través de un adulto responsable.
            </p>

            {/* Teléfono */}
            <div className="mt-6">
              <p className="text-sm text-white/50">Contacto adulto responsable</p>
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="mt-1 inline-block text-lg font-medium hover:underline"
              >
                {phone}
              </a>
            </div>

            {/* Redes */}
            <div className="mt-8 flex items-center gap-5">
              <SocialIcon href={instagramUrl} label="Instagram">
                <InstagramIcon />
              </SocialIcon>

              <SocialIcon href={tiktokUrl} label="TikTok">
                <TikTokIcon />
              </SocialIcon>

              <SocialIcon href={youtubeUrl} label="YouTube">
                <YouTubeIcon />
              </SocialIcon>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-6 text-xs text-white/40">
          © {new Date().getFullYear()} – Portfolio
        </div>
      </div>
    </footer>
  );
}

/* ------------------ Polaroid Stack ------------------ */

function PolaroidStack({ items }: { items: FooterItem[] }) {
  const [active, setActive] = useState(0);

  // drag state (solo para la card activa)
  const [drag, setDrag] = useState({ x: 0, y: 0, dragging: false });

  const stack = useMemo(() => (items || []).slice(0, 4), [items]);

  // presets encimados
  const presets = [
    { r: -7, x: -45, y: 6 },
    { r: 6, x: 30, y: -16 },
    { r: -25, x: -45, y: 18 },
    { r: 9, x: 78, y: 22 },
  ];

  const ptr = useRef<{ id: number | null; sx: number; sy: number }>({
    id: null,
    sx: 0,
    sy: 0,
  });

  const clampIndex = (idx: number) => {
    const n = stack.length || 1;
    return ((idx % n) + n) % n;
  };

  const onPointerDownTop = (e: React.PointerEvent<HTMLDivElement>) => {
    ptr.current.id = e.pointerId;
    ptr.current.sx = e.clientX;
    ptr.current.sy = e.clientY;

    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);

    setDrag({ x: 0, y: 0, dragging: true });
  };

  const onPointerMoveTop = (e: React.PointerEvent<HTMLDivElement>) => {
    if (ptr.current.id !== e.pointerId) return;

    const dx = e.clientX - ptr.current.sx;
    const dy = e.clientY - ptr.current.sy;

    setDrag({ x: dx, y: dy, dragging: true });
  };

  const onPointerUpTop = (e: React.PointerEvent<HTMLDivElement>) => {
    if (ptr.current.id !== e.pointerId) return;

    const TH = 55; // umbral swipe

    const dx = drag.x;
    const dy = drag.y;

    if (Math.abs(dx) > TH && Math.abs(dx) > Math.abs(dy)) {
      setActive((prev) => clampIndex(dx < 0 ? prev + 1 : prev - 1));
    }

    setDrag({ x: 0, y: 0, dragging: false });
    ptr.current.id = null;
  };

  return (
    <div className="relative h-[320px] w-[300px] sm:h-[340px] sm:w-[320px] md:h-[360px] md:w-[340px]">
      {stack.map((it, i) => {
        const p = presets[i] || presets[0];
        const isActive = i === active;

        const extraX = isActive ? drag.x : 0;
        const extraY = isActive ? drag.y : 0;
        const extraR = isActive ? Math.max(-12, Math.min(12, drag.x / 12)) : 0;

        return (
          <div
            key={it._id || it.url || i}
            className={[
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              isActive ? "z-[50]" : `z-[${10 + i}]`,
            ].join(" ")}
          >
            <div
              className={cn(
                "transition-transform",
                isActive && drag.dragging ? "" : "duration-300"
              )}
              style={{
                transform: `translate(${p.x + extraX}px, ${p.y + extraY}px) rotate(${p.r + extraR}deg)`,
                touchAction: isActive ? "pan-y" : "auto",
              }}
              onPointerDown={isActive ? onPointerDownTop : undefined}
              onPointerMove={isActive ? onPointerMoveTop : undefined}
              onPointerUp={isActive ? onPointerUpTop : undefined}
              onPointerCancel={isActive ? onPointerUpTop : undefined}
            >
              <PolaroidCard
                src={it.url}
                caption={it.title}
                active={isActive}
                onClick={() => setActive(i)}
                hintSwipe={stack.length > 1}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PolaroidCard({
  src,
  caption,
  active,
  onClick,
  hintSwipe,
}: {
  src: string;
  caption?: string;
  active?: boolean;
  onClick?: () => void;
  hintSwipe?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative rounded-2xl bg-white p-3 shadow-2xl",
        "w-[210px] sm:w-[220px] md:w-[230px]",
        "text-left cursor-pointer",
        "transition-transform duration-200",
        "hover:scale-[1.02]",
        active ? "scale-[1.06] ring-2 ring-[#C81D25]/50" : "ring-0",
      ].join(" ")}
      aria-label="Polaroid"
    >
      <div className="overflow-hidden rounded-xl bg-black">
        <img
          src={src}
          alt={caption || "polaroid"}
          className="h-[220px] w-full object-cover"
          loading="lazy"
          draggable={false}
        />
      </div>

      <div className="pt-8 text-center text-xs text-gray-500">
        {/* {caption || "Footer"} */}
      </div>

      {/* tape */}
      <div className="pointer-events-none absolute -top-2 left-1/2 h-6 w-20 -translate-x-1/2 rotate-[-2deg] rounded-md bg-black/10 opacity-0 transition group-hover:opacity-100" />

      {/* hint */}
      {active && hintSwipe && (
        <div className="pointer-events-none absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-black/40">
          Deslizá ↔
        </div>
      )}
    </button>
  );
}

/* ------------------ Social ------------------ */

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="
        grid h-11 w-11 place-items-center
        rounded-full border border-white/15
        bg-white/5
        transition hover:bg-white/10
      "
      title={label}
    >
      {children}
    </a>
  );
}

/* ------------------ Icons ------------------ */

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="white"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.6" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="white" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden>
      <path d="M16.5 3c.5 1.9 2 3.4 4 3.9v3.2c-1.7 0-3.3-.6-4.6-1.6v6.1a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v3.3a2.4 2.4 0 1 0 1.9 2.3V3h3.5z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden>
      <path d="M23 7.2s-.2-1.6-.8-2.3c-.7-.8-1.5-.8-1.9-.9C17.6 3.7 12 3.7 12 3.7h0s-5.6 0-8.3.3c-.4 0-1.2.1-1.9.9C1.2 5.6 1 7.2 1 7.2S.7 9 .7 10.8v1.7c0 1.8.3 3.6.3 3.6s.2 1.6.8 2.3c.7.8 1.7.8 2.1.9 1.5.2 6.1.3 8.1.3 0 0 5.6 0 8.3-.3.4 0 1.2-.1 1.9-.9.6-.7.8-2.3.8-2.3s.3-1.8.3-3.6v-1.7C23.3 9 23 7.2 23 7.2zM9.7 14.5V8.9l5.4 2.8-5.4 2.8z" />
    </svg>
  );
}
