"use client";

import { useState } from "react";

type Res = { ok: boolean; error?: string };

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setDone(null);

    if (!name.trim()) return setError("Nombre requerido");
    if (!email.trim()) return setError("Email requerido");
    if (!message.trim()) return setError("Mensaje requerido");

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          message: message.trim(),
        }),
      });

      const data = (await res.json()) as Res;

      if (!res.ok || !data.ok) {
        setError(data.error || "No se pudo enviar");
        return;
      }

      setDone("Mensaje enviado correctamente.");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 text-white">
      {error && (
        <div className="rounded-1xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {done && (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
          {done}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm text-white/80">Nombre</label>
          <input
            className="
              mt-1 w-full rounded-xl
              border border-white/15
              bg-black/60
              px-3 py-2
              text-white
              placeholder:text-white/30
              outline-none
              focus:border-white/30
              focus:ring-0
            "
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className="text-sm text-white/80">Email</label>
          <input
            className="
              mt-1 w-full rounded-xl
              border border-white/15
              bg-black/60
              px-3 py-2
              text-white
              placeholder:text-white/30
              outline-none
              focus:border-white/30
              focus:ring-0
            "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-white/80">Mensaje</label>
        <textarea
          className="
            mt-1 w-full rounded-xl
            border border-white/15
            bg-black/60
            px-3 py-2
            text-white
            placeholder:text-white/30
            outline-none
            focus:border-white/30
            focus:ring-0
            resize-none
          "
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribí tu mensaje…"
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={() => void submit()}
          disabled={loading}
          className="
            rounded-xl
            bg-[#C81D25]
            px-5 py-2.5
            text-sm font-medium
            text-white
            transition
            hover:bg-[#b01920]
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
          type="button"
        >
          {loading ? "Enviando…" : "Enviar"}
        </button>
      </div>
    </div>
  );
}
