import HeroBanner from "./public/HeroBanner";
import MediaCarousel from "./public/MediaCarousel";
import ContactSection from "./public/ContactSection";
import { headers } from "next/headers";

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

function catName(c: Category | string): string {
  return typeof c === "string" ? c : c?.name || "";
}

// ✅ Next 16: headers() puede ser Promise -> hay que await
async function getBaseUrl() {

  const h = await headers();

  const host =
    h.get("x-forwarded-host") ||
    h.get("host") ||
    process.env.APP_URL?.replace(/^https?:\/\//, "");

  if (!host) {
    // fallback dev
    return "http://localhost:3000";
  }

  const proto =
    h.get("x-forwarded-proto") ||
    (process.env.NODE_ENV === "development" ? "http" : "https");

  return `${proto}://${host}`;
}

async function getJson<T>(path: string): Promise<T> {
  const baseUrl = await getBaseUrl();
  const url = new URL(path, baseUrl);

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Error fetch ${path} (${res.status})`);
  }

  return res.json();
}

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

  const categories = cData.ok ? cData.categories || [] : [];
  const items = mData.ok ? mData.items || [] : [];

  const bannerCat = categories.find(
    (c) => c.active && c.name.toLowerCase() === "banner"
  );

  const carouselCat = categories.find(
    (c) => c.active && c.name.toLowerCase() === "carousel"
  );

  const bannerItems = bannerCat
    ? items.filter(
        (m) =>
          typeof m.category !== "string" && m.category?._id === bannerCat._id
      )
    : items.filter((m) => catName(m.category).toLowerCase() === "banner");

  const carouselItems = carouselCat
    ? items.filter(
        (m) =>
          typeof m.category !== "string" && m.category?._id === carouselCat._id
      )
    : items.filter((m) => catName(m.category).toLowerCase() === "carousel");

  // Hero: destacado o primero (foto o video)
  const banner =
    bannerItems.find((x) => x.isFeatured) || bannerItems[0] || null;

  // Carrusel: solo fotos en esta primera versión
  const carousel = carouselItems.filter((x) => x.type === "photo");

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
