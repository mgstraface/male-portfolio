/* app/public/FooterSection.tsx */
/* eslint-disable @next/next/no-img-element */
"use client";

type FooterItem = {
  url: string;
  title?: string;
};

export default function FooterSection({
  item,
  phone,
  instagramUrl,
  tiktokUrl,
  youtubeUrl,
}: {
  item: FooterItem | null;
  phone: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
}) {
  return (
    <footer className="relative mt-24 border-t border-white/10 bg-black">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-12 items-center">
          {/* IZQUIERDA – POLAROID */}
          <div className="md:col-span-5 flex justify-center md:justify-start">
            {item?.url ? (
              <div className="relative bg-white rounded-xl p-3 shadow-2xl rotate-[-2deg]">
                <img
                  src={item.url}
                  alt={item.title || "footer"}
                  className="h-[260px] w-[220px] object-cover rounded-md"
                />
                <div className="pt-3 text-center text-xs text-gray-500">
                  {item.title || "footer"}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-sm text-white/60">
                No hay imagen cargada en la categoría <b>footer</b>
              </div>
            )}
          </div>

          {/* DERECHA – INFO */}
          <div className="md:col-span-7 text-white">
            <p className="text-xs tracking-widest uppercase text-white/40">
              Contacto
            </p>

            <h3 className="mt-2 text-2xl md:text-3xl font-semibold">
              ¿Querés comunicarte con Malena?
            </h3>

            <p className="mt-4 text-white/70 max-w-xl">
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
              <SocialLink href={instagramUrl} label="Instagram">
                <InstagramIcon />
              </SocialLink>

              <SocialLink href={tiktokUrl} label="TikTok">
                <TikTokIcon />
              </SocialLink>

              <SocialLink href={youtubeUrl} label="YouTube">
                <YouTubeIcon />
              </SocialLink>
            </div>
          </div>
        </div>

        {/* línea final */}
        <div className="mt-16 border-t border-white/10 pt-6 text-xs text-white/40">
          © {new Date().getFullYear()} – Portfolio
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------ */
/* Helpers */

function SocialLink({
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
        h-11 w-11 rounded-full
        border border-white/15
        bg-white/5
        grid place-items-center
        hover:bg-white/10
        transition
      "
    >
      {children}
    </a>
  );
}

/* ------------------------------------------------------------ */
/* ICONOS */

function InstagramIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.6"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="white" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="white"
    >
      <path d="M16.5 3c.5 1.9 2 3.4 4 3.9v3.2c-1.7 0-3.3-.6-4.6-1.6v6.1a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v3.3a2.4 2.4 0 1 0 1.9 2.3V3h3.5z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="white"
    >
      <path d="M23 7.2s-.2-1.6-.8-2.3c-.7-.8-1.5-.8-1.9-.9C17.6 3.7 12 3.7 12 3.7h0s-5.6 0-8.3.3c-.4 0-1.2.1-1.9.9C1.2 5.6 1 7.2 1 7.2S.7 9 .7 10.8v1.7c0 1.8.3 3.6.3 3.6s.2 1.6.8 2.3c.7.8 1.7.8 2.1.9 1.5.2 6.1.3 8.1.3 0 0 5.6 0 8.3-.3.4 0 1.2-.1 1.9-.9.6-.7.8-2.3.8-2.3s.3-1.8.3-3.6v-1.7C23.3 9 23 7.2 23 7.2zM9.7 14.5V8.9l5.4 2.8-5.4 2.8z" />
    </svg>
  );
}
