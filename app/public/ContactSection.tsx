import ContactForm from "./ContactForm";

export default function ContactSection() {
  return (
    <section id="contacto" className="space-y-4">
       
      <div>
           <div
          style={{ fontFamily: "var(--font-thirstycaps)" }}
          className="text-[45px] sm:text-[75px] leading-none italic text-red-600"
        >
          Contacto
        </div>
        <p className="mt-1 text-sm text-white/60">Dejá tu mensaje o consulta.</p>
      </div>

      <div className="rounded-1xl border border-white/10 bg-white/5 p-6 shadow-2xl">
        <ContactForm />
      </div>
    </section>
  );
}
