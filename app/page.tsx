/* eslint-disable @typescript-eslint/no-explicit-any */
// app/page.tsx
import HeroBanner from "./public/HeroBanner";
import MediaCarousel from "./public/MediaCarousel";
import ContactSection from "./public/ContactSection";
import ProjectsSection from "./public/ProjectsSection";
import FooterSection from './public/FooterSection';
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

  album?: string | null;
  name?: string;
  description?: string;

  type: "photo" | "video";
  category: Category | string | any;
  url: string;
  thumbnail?: string;
  isFeatured: boolean;
  fullVideoUrl?: string;
  createdAt?: string;
};

// ✅ shape nuevo del endpoint /api/media/projects
type ProjectsApiGroup = {
  album: string;
  name: string;
  description: string;
  count: number;
  hasVideo: boolean;
  cover: { type: "photo" | "video"; url: string; thumbnail?: string; fullVideoUrl?: string };
  thumbs: Array<{ _id: string; type: "photo" | "video"; url: string; thumbnail?: string; fullVideoUrl?: string }>;
};

type ProjectsApiResponse =
  | {
      ok: true;
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      projects: ProjectsApiGroup[];
    }
  | { ok: false; error: string };

function catName(c: Category | string): string {
  return typeof c === "string" ? c : c?.name || "";
}

function catId(c: any): string {
  if (!c) return "";
  if (typeof c === "string") return c;
  return c._id || c.id || "";
}

async function getBaseUrl() {
  const h = await headers();

  const host =
    h.get("x-forwarded-host") ||
    h.get("host") ||
    process.env.APP_URL?.replace(/^https?:\/\//, "");

  if (!host) return "http://localhost:3000";

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
  const [cData, mData, pData] = await Promise.all([
    getJson<{ ok: boolean; categories?: Category[]; error?: string }>("/api/categories"),
    getJson<{ ok: boolean; items?: MediaItem[]; error?: string }>("/api/media"),

    // ✅ pedimos la primera página (el resto lo hace el client con "Cargar más")
    getJson<ProjectsApiResponse>("/api/media/projects?page=1&limit=6"),
  ]);

  const categories = cData.ok ? cData.categories || [] : [];
  const items = mData.ok ? mData.items || [] : [];

  const findCat = (name: string) =>
    categories.find((c) => c.active && c.name.toLowerCase().trim() === name.toLowerCase().trim());

  const bannerCat = findCat("banner") || findCat("Banner");
  const carouselCat = findCat("carousel");
const footerCat = findCat("footer") || findCat("Footer");

  const byCat = (cat: Category | undefined, fallbackName: string) => {
    if (cat?._id) {
      const target = cat._id;
      return items.filter((m) => catId(m.category) === target);
    }
    const n = fallbackName.toLowerCase().trim();
    return items.filter((m) => catName(m.category).toLowerCase().trim() === n);
  };

  const bannerItems = byCat(bannerCat, "banner");
  const carouselItems = byCat(carouselCat, "carousel");
const footerItems = byCat(footerCat, "footer");
// opcional: featured primero
footerItems.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));


  const banner = bannerItems.find((x) => x.isFeatured) || bannerItems[0] || null;
  const carousel = carouselItems.filter((x) => x.type === "photo");

  return (
  <main className="min-h-screen bg-black">
    <HeroBanner item={banner} />

    <div className="mx-auto max-w-6xl px-4 py-10 space-y-10">
      <MediaCarousel
        title="Galería"
        subtitle="Una selección de fotos destacadas"
        items={carousel}
      />

      <ProjectsSection
        title="Projects"
        subtitle="Selección de proyectos y sesiones"
        initial={pData as any}
        pageSize={6}
      />

      <ContactSection />
    </div>

    {/* ✅ FOOTER full-width */}
   <FooterSection
    items={footerItems.slice(0, 4)}
  phone="+54 11 XXXX-XXXX"
  instagramUrl="https://instagram.com/..."
  tiktokUrl="https://www.tiktok.com/@maaleeee4"
  youtubeUrl="https://youtube.com/@..."
/>

  </main>
  );
}
