"use client";

import React, { useEffect, useState } from "react";

function cn(...arr: Array<string | false | undefined | null>) {
  return arr.filter(Boolean).join(" ");
}

export default function BackToTop({
  showAfter = 320,
  className = "",
}: {
  showAfter?: number;
  className?: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      setShow(y > showAfter);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  const goTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  return (
    <button
      type="button"
      onClick={goTop}
      aria-label="Volver arriba"
      title="Volver arriba"
      className={cn(
        "fixed z-[90] right-4 bottom-4 sm:right-6 sm:bottom-6",
        "rounded-full border border-white/15 bg-black/55 backdrop-blur-md",
        "text-white/90 hover:bg-white/10",
        "shadow-[0_10px_30px_rgba(0,0,0,0.45)]",
        "transition-all duration-200",
        "h-11 w-11 grid place-items-center",
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none",
        className
      )}
    >
      {/* flecha */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 5l-7 7 1.4 1.4L11 8.8V20h2V8.8l4.6 4.6L19 12l-7-7z"
          fill="currentColor"
          opacity="0.95"
        />
      </svg>
    </button>
  );
}
