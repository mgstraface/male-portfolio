/* eslint-disable @typescript-eslint/no-explicit-any */
// app/page.tsx
import HeroBanner from "./public/HeroBanner";
import MediaCarousel from "./public/MediaCarousel";
import ContactSection from "./public/ContactSection";
import ProjectsSection from "./public/ProjectsSection";
import FooterSection from "./public/FooterSection";
import BackToTop from "./public/BackToTop";


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
  | { ok: true; page: number; limit: number; total: number; totalPages: number; projects: ProjectsApiGroup[] }
  | { ok: false; error: string };

function catName(c: Category | string): string {
  return typeof c === "string" ? c : c?.name || "";
}
function catId(c: any): string {
  if (!c) return "";
  if (typeof c === "string") return c;
  return c._id || c.id || "";
}

/**
 * ✅ IMPORTANTÍSIMO:
 * En server (Next) no uses fetch("/api/...") relativo.
 * Usamos APP_URL (recomendado) y fallback a localhost:PORT.
 *
 * - Local: APP_URL=http://localhost:3000
 * - Docker (adentro del container): APP_URL=http://localhost:3000
 */
function getServerBaseUrl() {
  const env = process.env.APP_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  const port = process.env.PORT || "3000";
  return `http://localhost:${port}`;
}

async function getJson<T>(path: string): Promise<T> {
  const base = getServerBaseUrl();
  const url = `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Error fetch ${path} (${res.status})`);
  return res.json();
}

export default async function HomePage() {
  const [cData, mData, pData] = await Promise.all([
    getJson<{ ok: boolean; categories?: Category[]; error?: string }>("/api/categories"),
    getJson<{ ok: boolean; items?: MediaItem[]; error?: string }>("/api/media"),
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

  footerItems.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));

  const banner = bannerItems.find((x) => x.isFeatured) || bannerItems[0] || null;
  const carousel = carouselItems.filter((x) => x.type === "photo");

  // ✅ “sentada” (para carousel)
  const sittingCat = findCat("sentada") || findCat("Sentada") || findCat("sitting") || findCat("Sitting");
  const sittingItems = byCat(sittingCat, "sentada");
  const sitting = sittingItems.find((x) => x.isFeatured) || sittingItems[0] || null;

  // ✅ “sentadaContact” (para Contacto)
  const sittingContactCat =
    findCat("sentadaContact") ||
    findCat("SentadaContact") ||
    findCat("sentada_contact") ||
    findCat("Sentada Contact") ||
    findCat("contactSitting") ||
    findCat("contact_sitting");

  const sittingContactItems = byCat(sittingContactCat, "sentada2");
  const sittingContact = sittingContactItems.find((x) => x.isFeatured) || sittingContactItems[0] || null;

  return (
    <main className="min-h-screen bg-black">
      <HeroBanner item={banner} />

      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 2xl:px-20 py-10 space-y-12">
        <MediaCarousel
          title="Galería"
          subtitle="Una selección de fotos destacadas"
          items={carousel}
          sitting={sitting}
          trainingTitle="Formación académica"
          trainingIntro="Cursos"
          trainingItems={[
            "Introducción a la programación - [2022-2023]",
            "Construct - [2023-2024]",
            "Unreal Engine - [2023-2025]",
            "Desarrollo web - [2025]",
            "Contenidos audiovisuales - [2025-2026]",
            "Inglés - B1"
          ]}
        />

        <ProjectsSection title="Projects" subtitle="Selección de proyectos y sesiones" initial={pData as any} pageSize={6} />

        <ContactSection
          sittingContact={sittingContact}
          trainingTitle="Formación artística"
          trainingIntro="Estudios y experiencias:"
          trainingItems={[
            "Academia: Y si bailamos - [2014-2023]",
            "Grupo competencia Impacto Crew, Academia Estilo Urbano - [2023-ACTUALIDAD]",
            "Competencia 3.3 Rosario [2023]",
            "Universal Dance, San Lorenzo, Brasil, Mexico [2024-2026]",
            "Workshops instituto CDF, Rosario [Valentina Toranzo, Mati Napp, Sol Alonso, Edson SJ, Yabil Recamier, Milu Aldas, Pecas Conte]",
            "Instructorado Street Dance academia Street Beat [2025]",
          ]}
        />
      </div>

      <FooterSection
        items={footerItems.slice(0, 4)}
        phone="+54 3401 43-4757"
        instagramUrl="https://instagram.com/malestraface"
        tiktokUrl="https://www.tiktok.com/@maaleeee4"
        youtubeUrl="https://youtube.com/@MaleStraface"
      />


      <BackToTop showAfter={320} />

    </main>
  );
}
