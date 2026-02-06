import ContactForm from './ContactForm';

export default function ContactSection() {
  return (
    <section id="contacto" className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Contacto</h2>
        <p className="mt-1 text-sm text-gray-600">
          Dejá tu mensaje y te respondemos.
        </p>
      </div>

      <div className="rounded-3xl border bg-white p-6">
        <ContactForm />
      </div>
    </section>
  );
}
