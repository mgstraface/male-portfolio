import ContactForm from "./ContactForm";

export default function ContactSection() {
  return (
    <section id="contacto" className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-white">Contacto</h2>
        <p className="mt-1 text-sm text-white/60">Dejá tu mensaje y te respondemos.</p>
      </div>

      <div className="rounded-1xl border border-white/10 bg-white/5 p-6 shadow-2xl">
        <ContactForm />
      </div>
    </section>
  );
}
