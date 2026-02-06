import HeroBanner from "./public/HeroBanner";
import MediaCarousel from "./public/MediaCarousel";
import ContactSection from "./public/ContactSection";
import { headers } from "next/headers";

/* =========================
   TYPES
========================= */

type Category = {
  _id: string;
  name: string;
  type: "photo" | "video";
  active: boolean;
};

type MediaItem = {
  _id: string;
  title?: string;
  type: "photo" | "video";
  category: Category | string;
  url: string;
  thumbnail?: string;
  isFeatured: boolean;
  fullVideoUrl?: string;
  createdAt?: string;
};

/* =========================
   HELPERS SERVER-SIDE
========================= */

function getBaseUrl() {
  const h = headers();
  const host = h.get("host");

  if (!host) {
    throw new Error("No se pudo determinar el host");
  }

  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https";

  return `${protocol}://${host}`;
}

async function getJson<T>(path: string): Promise<T> {
  const baseUrl = getBaseUrl();

  const res = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Error fetch ${path}`);
  }

  return res.json();
}

function catName(c: Category | string): string {
  return typeof c === "string" ? c : c?.name || "";
}

/* =========================
   PAGE
========================= */

export default async function HomePage() {
  const cData = await getJson<{
    ok: boolean;
    categories?: Category[];
    error?: string;
  }>("/api/categories");

  const mData = await getJson<{
    ok: boolean;
    items?: MediaItem[];
    error?: string;
  }>("/api/media");

  const categories = cData.ok ? cData.categories ?? [] : [];
  const items = mData.ok ? mData.items ?? [] : [];

  const bannerCat = categories.find(
    (c) => c.active && c.name.toLowerCase() === "banner"
  );

  const carouselCat = categories.find(
    (c) => c.active && c.name.toLowerCase() === "carousel"
  );

  const bannerItems = bannerCat
    ? items.filter(
        (m) =>
          typeof m.category !== "string" &&
          m.category?._id === bannerCat._id
      )
    : items.filter(
        (m) => catName(m.category).toLowerCase() === "banner"
      );

  const carouselItems = carouselCat
    ? items.filter(
        (m) =>
          typeof m.category !== "string" &&
          m.category?._id === carouselCat._id
      )
    : items.filter(
        (m) => catName(m.category).toLowerCase() === "carousel"
      );

  const banner =
    bannerItems.find((x) => x.isFeatured) ??
    bannerItems[0] ??
    null;

  const carousel = carouselItems.filter(
    (x) => x.type === "photo"
  );

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-10">
        <HeroBanner item={banner} />

        <MediaCarousel
          title="Galería"
          subtitle="Una selección de fotos destacadas"
          items={carousel}
        />

        <ContactSection />
      </div>
    </main>
  );
}
