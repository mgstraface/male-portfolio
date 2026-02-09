/* eslint-disable @typescript-eslint/no-explicit-any */
// app/page.tsx
import HeroBanner from "./public/HeroBanner";
import MediaCarousel from "./public/MediaCarousel";
import ContactSection from "./public/ContactSection";
import ProjectsSection from "./public/ProjectsSection";
import { headers } from "next/headers";

type Category = {
  _id: string;
  name: string;
  type: "photo" | "video";
  active: boolean;
};

type MediaItem = {
  _id: string;

  // legacy
  title?: string;

  // projects
  name?: string;
  description?: string;

  type: "photo" | "video";
  category: Category | string | any; // <- puede venir populado raro (id vs _id)
  url: string;
  thumbnail?: string;
  isFeatured: boolean;
  fullVideoUrl?: string;
  createdAt?: string;
};

function catName(c: Category | string): string {
  return typeof c === "string" ? c : c?.name || "";
}

function catId(c: any): string {
  if (!c) return "";
  if (typeof c === "string") return c;
  return c._id || c.id || "";
}

// ✅ Next 16: headers() puede ser Promise -> hay que await
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

  const findCat = (name: string) =>
    categories.find(
      (c) => c.active && c.name.toLowerCase().trim() === name.toLowerCase().trim()
    );

  const bannerCat = findCat("banner") || findCat("Banner");
  console.log(bannerCat)
  const carouselCat = findCat("carousel");
  const projectsCat = findCat("projects") || findCat("Projects");

  const byCat = (cat: Category | undefined, fallbackName: string) => {
    // 1) si tengo cat, matcheo por ID (soporta string, _id o id)
    if (cat?._id) {
      const target = cat._id;
      return items.filter((m) => catId(m.category) === target);
    }

    // 2) fallback por nombre
    const n = fallbackName.toLowerCase().trim();
    return items.filter((m) => catName(m.category).toLowerCase().trim() === n);
  };

  const bannerItems = byCat(bannerCat, "banner");
  const carouselItems = byCat(carouselCat, "carousel");

  // projects: si existe la categoría "Projects" usamos esa;
  // si no, fallback por nombre "projects"
  const projectItems = byCat(projectsCat, "projects");

  // Hero: destacado o primero (foto o video)
  const banner = bannerItems.find((x) => x.isFeatured) || bannerItems[0] || null;

  // Carrusel: solo fotos
  const carousel = carouselItems.filter((x) => x.type === "photo");

  // Projects: fotos o videos, ordenados por fecha desc
  const projects = projectItems
    .filter((x) => x.type === "photo" || x.type === "video")
    .sort((a, b) => {
      const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bd - ad;
    });

  return (
<main className="min-h-screen bg-black">
  {/* HERO FULL WIDTH */}
  <HeroBanner item={banner} />

  {/* CONTENIDO ACOTADO */}
  <div className="mx-auto max-w-6xl px-4 py-10 space-y-10">
    <MediaCarousel
      title="Galería"
      subtitle="Una selección de fotos destacadas"
      items={carousel}
    />

    <ProjectsSection
      title="Projects"
      subtitle="Selección de proyectos y sesiones"
      items={projects}
    />

    <ContactSection />
  </div>
</main>
  );
}
