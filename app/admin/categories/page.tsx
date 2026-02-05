"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Category = {
  _id: string;
  name: string;
  type: "photo" | "video";
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ApiListResponse =
  | { ok: true; categories: Category[] }
  | { ok: false; error: string };

type ApiOneResponse =
  | { ok: true; category: Category }
  | { ok: false; error: string };

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Crear
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"photo" | "video">("photo");
  const [newActive, setNewActive] = useState(true);

  // Editar
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingItem = useMemo(
    () => items.find((x) => x._id === editingId) || null,
    [items, editingId]
  );
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<"photo" | "video">("photo");
  const [editActive, setEditActive] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = (await res.json()) as ApiListResponse;

      if (!res.ok || !data.ok) {
        setError(!data.ok ? data.error : "Error al cargar categorías");
        setItems([]);
        return;
      }

      setItems(data.categories);
    } catch {
      setError("Error de red al cargar categorías");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openEdit = (cat: Category) => {
    setEditingId(cat._id);
    setEditName(cat.name);
    setEditType(cat.type);
    setEditActive(cat.active);
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditType("photo");
    setEditActive(true);
  };

  const createCategory = async () => {
    const name = newName.trim();
    if (!name) {
      setError("El nombre no puede estar vacío");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type: newType, active: newActive }),
      });

      const data = (await res.json()) as ApiOneResponse;

      if (!res.ok || !data.ok) {
        setError(!data.ok ? data.error : "Error al crear categoría");
        return;
      }

      setNewName("");
      setNewType("photo");
      setNewActive(true);

      // refresco local (sin depender de sort server)
      setItems((prev) => [data.category, ...prev]);
    } catch {
      setError("Error de red al crear categoría");
    } finally {
      setSaving(false);
    }
  };

  const updateCategory = async () => {
    if (!editingId) return;

    const name = editName.trim();
    if (!name) {
      setError("El nombre no puede estar vacío");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/categories/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type: editType, active: editActive }),
      });

      const data = (await res.json()) as ApiOneResponse;

      if (!res.ok || !data.ok) {
        setError(!data.ok ? data.error : "Error al actualizar categoría");
        return;
      }

      setItems((prev) => prev.map((x) => (x._id === editingId ? data.category : x)));
      closeEdit();
    } catch {
      setError("Error de red al actualizar categoría");
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    const cat = items.find((x) => x._id === id);
    const ok = confirm(
      `¿Eliminar categoría${cat?.name ? ` "${cat.name}"` : ""}?\n\nEsto no borra media automáticamente.`
    );
    if (!ok) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { ok: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setError(data.error || "Error al borrar categoría");
        return;
      }

      setItems((prev) => prev.filter((x) => x._id !== id));
      if (editingId === id) closeEdit();
    } catch {
      setError("Error de red al borrar categoría");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm text-gray-600 hover:underline">
              ← Volver
            </Link>
          </div>
          <h1 className="mt-2 text-2xl font-semibold">Categorías</h1>
          <p className="mt-1 text-sm text-gray-600">
            Administrá categorías para fotos y videos.
          </p>
        </div>

        <button
          onClick={() => void load()}
          disabled={loading || saving}
          className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
        >
          {loading ? "Cargando..." : "Refrescar"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Crear */}
      <div className="rounded-2xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Nueva categoría</h2>
          <span className="text-xs text-gray-500">
            {saving ? "Guardando..." : ""}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Nombre</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="Ej: Moda, Editorial, Baile..."
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tipo</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as "photo" | "video")}
              className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option value="photo">Foto</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={newActive}
                onChange={(e) => setNewActive(e.target.checked)}
              />
              Activa
            </label>

            <button
              onClick={() => void createCategory()}
              disabled={saving}
              className="ml-auto rounded-xl bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
            >
              Crear
            </button>
          </div>
        </div>
      </div>

      {/* Lista + Edit */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Lista */}
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="text-lg font-medium">Listado</h2>

          {loading ? (
            <p className="mt-4 text-sm text-gray-600">Cargando...</p>
          ) : items.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">No hay categorías todavía.</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Nombre</th>
                    <th className="px-3 py-2 text-left font-medium">Tipo</th>
                    <th className="px-3 py-2 text-left font-medium">Estado</th>
                    <th className="px-3 py-2 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr key={c._id} className="border-t">
                      <td className="px-3 py-2">{c.name}</td>
                      <td className="px-3 py-2">
                        {c.type === "photo" ? "Foto" : "Video"}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={
                            "inline-flex rounded-full px-2 py-0.5 text-xs " +
                            (c.active
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600")
                          }
                        >
                          {c.active ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => openEdit(c)}
                            disabled={saving}
                            className="rounded-lg border px-2 py-1 hover:bg-gray-100 disabled:opacity-50"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => void deleteCategory(c._id)}
                            disabled={saving}
                            className="rounded-lg border px-2 py-1 hover:bg-gray-100 disabled:opacity-50"
                          >
                            Borrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="text-lg font-medium">Editar</h2>

          {!editingItem ? (
            <p className="mt-4 text-sm text-gray-600">
              Seleccioná una categoría en la tabla para editarla.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Tipo</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as "photo" | "video")}
                  className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
                >
                  <option value="photo">Foto</option>
                  <option value="video">Video</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Si cambiás el tipo, asegurate de que el contenido asociado tenga sentido.
                </p>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                />
                Activa
              </label>

              <div className="flex gap-2">
                <button
                  onClick={() => void updateCategory()}
                  disabled={saving}
                  className="rounded-xl bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  Guardar
                </button>
                <button
                  onClick={closeEdit}
                  disabled={saving}
                  className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
