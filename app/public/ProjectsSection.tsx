/* app/public/ProjectsSection.tsx */
/* eslint-disable @next/next/no-img-element */
"use client";

type ProjectItem = {
  _id: string;
  url: string;
  name?: string;
  description?: string;
  title?: string; // fallback
};

function ProjectCard({ item, flip }: { item: ProjectItem; flip?: boolean }) {
  const name = item.name || item.title || "Proyecto";
  const desc = item.description || "Sin descripción";

  return (
    <article className="rounded-[28px] border border-black/10 bg-white p-6 md:p-8">
      <div className="grid items-center gap-8 md:grid-cols-2">
        {/* TEXTO */}
        <div
          className={[
            flip ? "md:order-2" : "",
            // ✅ clave: padding interno extra del lado “cercano” a la imagen
            flip ? "md:pl-10 md:pr-4" : "md:pr-10 md:pl-4",
          ].join(" ")}
        >
          <div className="text-[11px] tracking-widest text-black/40 uppercase">
            Project
          </div>

          <h3 className="mt-2 text-2xl md:text-[28px] font-semibold tracking-tight text-black">
            {name}
          </h3>

          <p className="mt-3 text-black/60 leading-relaxed">{desc}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#galeria"
              className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:bg-black/90"
            >
              Ver galería
            </a>
            <a
              href="#contacto"
              className="rounded-xl border border-black/15 px-4 py-2 text-sm hover:bg-black/[0.03]"
            >
              Consultar
            </a>
          </div>
        </div>

        {/* IMAGEN + MANCHA */}
        <div className={flip ? "md:order-1" : ""}>
          <div className="relative">
            {/* “mancha” detrás */}
            <div
              aria-hidden
              className={[
                "absolute -inset-6 md:-inset-7",
                "rounded-[46px]",
                "bg-[#F6C34A]/90",
                flip ? "rotate-[8deg]" : "-rotate-[8deg]",
              ].join(" ")}
            />

            {/* imagen */}
            <div className="relative overflow-hidden rounded-[24px] border border-black/10 bg-gray-50">
              <img
                src={item.url}
                alt={name}
                className="h-[240px] w-full object-cover md:h-[320px]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ProjectsSection({
  items,
  title = "Projects",
  subtitle = "Selección de proyectos y sesiones",
}: {
  items: ProjectItem[];
  title?: string;
  subtitle?: string;
}) {
  if (!items || items.length === 0) return null;


  
  return (
    <section id="projects" className="space-y-6">
      <header className="space-y-2">
        <div className="text-xs tracking-widest text-black/40 uppercase">
          {title}
        </div>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-black">
          {subtitle}
        </h2>
      </header>

      <div className="grid gap-6">
        {items.map((p, i) => (
          <ProjectCard key={p._id} item={p} flip={i % 2 === 1} />
        ))}
      </div>
    </section>
  );
}
