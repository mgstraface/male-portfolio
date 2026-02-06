"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ContactMsg = {
  _id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt?: string;
  ip?: string;
  userAgent?: string;
};

type ListRes =
  | { ok: true; messages: ContactMsg[] }
  | { ok: false; error: string };

type OneRes =
  | { ok: true; message: ContactMsg }
  | { ok: false; error: string };

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [onlyUnread, setOnlyUnread] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => messages.find((m) => m._id === selectedId) || null,
    [messages, selectedId]
  );

  const filtered = useMemo(() => {
    return onlyUnread ? messages.filter((m) => !m.read) : messages;
  }, [messages, onlyUnread]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", { cache: "no-store" });
      const data = (await res.json()) as ListRes;
      if (!res.ok || !data.ok) throw new Error(!data.ok ? data.error : "Error messages");
      setMessages(data.messages);
      if (data.messages.length && !selectedId) setSelectedId(data.messages[0]._id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error cargando mensajes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setRead = async (id: string, read: boolean) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read }),
      });
      const data = (await res.json()) as OneRes;
      if (!res.ok || !data.ok) {
        setError(!data.ok ? data.error : "Error actualizando");
        return;
      }
      setMessages((prev) => prev.map((m) => (m._id === id ? data.message : m)));
    } catch {
      setError("Error de red actualizando");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    const ok = confirm("¿Borrar este mensaje?");
    if (!ok) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/contact/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || "Error borrando");
        return;
      }
      setMessages((prev) => prev.filter((m) => m._id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch {
      setError("Error de red borrando");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm text-gray-600 hover:underline">
            ← Volver
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">Mensajes</h1>
          <p className="mt-1 text-sm text-gray-600">Contactos enviados desde el formulario.</p>
        </div>

        <button
          onClick={() => void load()}
          disabled={loading || saving}
          className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
        >
          {loading ? "Cargando..." : "Refrescar"}
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between rounded-2xl border bg-white p-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={onlyUnread} onChange={(e) => setOnlyUnread(e.target.checked)} />
          Solo no leídos
        </label>
        <div className="text-xs text-gray-500">
          Mostrando {filtered.length} de {messages.length}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* LIST */}
        <div className="rounded-2xl border bg-white p-4 lg:col-span-1">
          <h2 className="text-lg font-medium">Listado</h2>

          {loading ? (
            <p className="mt-4 text-sm text-gray-600">Cargando...</p>
          ) : filtered.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">No hay mensajes.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {filtered.map((m) => (
                <button
                  key={m._id}
                  onClick={() => setSelectedId(m._id)}
                  className={`w-full rounded-xl border p-3 text-left hover:bg-gray-50 ${
                    selectedId === m._id ? "ring-2 ring-gray-200" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{m.name}</div>
                    <div className="text-xs">{m.read ? "✅" : "🟡"}</div>
                  </div>
                  <div className="text-xs text-gray-500">{m.email}</div>
                  <div className="mt-2 line-clamp-2 text-sm text-gray-700">{m.message}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DETAIL */}
        <div className="rounded-2xl border bg-white p-4 lg:col-span-2">
          <h2 className="text-lg font-medium">Detalle</h2>

          {!selected ? (
            <p className="mt-4 text-sm text-gray-600">Seleccioná un mensaje.</p>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xl font-semibold">{selected.name}</div>
                  <div className="text-sm text-gray-600">{selected.email}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => void setRead(selected._id, !selected.read)}
                    disabled={saving}
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
                  >
                    {selected.read ? "Marcar como no leído" : "Marcar como leído"}
                  </button>

                  <button
                    onClick={() => void remove(selected._id)}
                    disabled={saving}
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
                  >
                    Borrar
                  </button>
                </div>
              </div>

              <div className="rounded-xl border bg-gray-50 p-4 whitespace-pre-wrap">{selected.message}</div>

              <div className="text-xs text-gray-500 space-y-1">
                <div>Estado: {selected.read ? "Leído" : "No leído"}</div>
                {selected.createdAt ? <div>Fecha: {new Date(selected.createdAt).toLocaleString("es-AR")}</div> : null}
                {selected.ip ? <div>IP: {selected.ip}</div> : null}
                {selected.userAgent ? <div className="truncate">UA: {selected.userAgent}</div> : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
