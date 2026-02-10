/* eslint-disable @typescript-eslint/no-explicit-any */
import ContactForm from "./ContactForm";

type MediaItem = {
  _id: string;
  title?: string;
  type: "photo" | "video";
  url: string;
  thumbnail?: string;
};

export default function ContactSection({
  sittingContact,
}: {
  sittingContact?: MediaItem | null;
}) {
  return (
    <section id="contacto" className="relative space-y-4">
      <div>
        <div
          style={{ fontFamily: "var(--font-thirstycaps)" }}
          className="text-[45px] sm:text-[75px] leading-none italic text-red-600"
        >
          Contacto
        </div>
        <p className="mt-1 text-sm text-white/60">Dejá tu mensaje o consulta.</p>
      </div>

      {/* ✅ Card + overlay sentado */}
      <div className="relative overflow-visible">
        {/* Overlay “sentada” apoyada en el borde superior del card */}
        {sittingContact?.url ? (
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              right-0
              -top-8 sm:-top-10 md:-top-12
              z-30
            "
            style={
              {
                // default (mobile)
                ["--sx" as any]: "70px",
              } as React.CSSProperties
            }
          >
            <div className="sm:[--sx:95px] md:[--sx:130px] lg:[--sx:170px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sittingContact.url}
                alt={sittingContact.title || "sentada contacto"}
                loading="lazy"
                className="
                  select-none
                  drop-shadow-[0_22px_40px_rgba(0,0,0,0.55)]
                  w-[180px] sm:w-[260px] md:w-[200px] lg:w-[230px]
                  translate-y-[-48%] sm:translate-y-[-45%] md:translate-y-[-42%] lg:translate-y-[-45%] lg:translate-x-[-45%]
                "
                style={{
                  transform: "translateX(calc(-50% + var(--sx)))",
                }}
              />

              {/* sombra suave de apoyo sobre el borde del card */}
              <div
                className="
                  absolute left-1/2 -translate-x-1/2
                  bottom-1
                  h-8 w-[72%]
                  rounded-full
                  bg-black/35 blur-2xl
                "
              />
            </div>
          </div>
        ) : null}

        {/* Card */}
        <div
          className="
            rounded-1xl border border-white/10 bg-white/5 p-6 shadow-2xl
            pr-[130px] sm:pr-[170px] md:pr-[230px] lg:pr-[300px]
          "
        >
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
