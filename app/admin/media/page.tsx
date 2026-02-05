/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

declare global {
  interface Window {
    cloudinary: any;
  }
}

type Category = {
  _id: string;
  name: string;
  type: "photo" | "video";
  active: boolean;
};

type MediaItem = {
  _id: string;
  title?: string;
  type: "photo" | "video";
  category: Category | string;
  url: string;
  thumbnail?: string;
  isFeatured: boolean;
  publicId?: string;
  resourceType?: "image" | "video";
  createdAt?: string;
};

type CategoriesResponse =
  | { ok: true; categories: Category[] }
  | { ok: false; error: string };

type MediaListResponse =
  | { ok: true; items: MediaItem[] }
  | { ok: false; error: string };

type MediaOneResponse =
  | { ok: true; item: MediaItem }
  | { ok: false; error: string };

export default function AdminMediaPage() {
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";
  const FOLDER = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || undefined;

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form
  const [type, setType] = useState<"photo" | "video">("photo");
  const [categoryId, setCategoryId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  // cloudinary result
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [uploadedPublicId, setUploadedPublicId] = useState<string>("");
  const [uploadedResourceType, setUploadedResourceType] = useState<"image" | "video" | "">("");
  const [uploadedThumb, setUploadedThumb] = useState<string>("");

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => c.active && c.type === type);
  }, [categories, type]);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cRes, mRes] = await Promise.all([
        fetch("/api/categories", { cache: "no-store" }),
        fetch("/api/media", { cache: "no-store" }),
      ]);

      const cData = (await cRes.json()) as CategoriesResponse;
      const mData = (await mRes.json()) as MediaListResponse;

      if (!cRes.ok || !cData.ok) throw new Error(!cData.ok ? cData.error : "Error categories");
      if (!mRes.ok || !mData.ok) throw new Error(!mData.ok ? mData.error : "Error media");

      setCategories(cData.categories);
      setItems(mData.items);

      const first = cData.categories.find((x) => x.active && x.type === type);
      if (first) setCategoryId(first._id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const first = categories.find((x) => x.active && x.type === type);
    if (first) setCategoryId(first._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const openWidget = () => {
    setError(null);

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setError("Faltan NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME / NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET");
      return;
    }

    if (!window.cloudinary) {
      setError("Cloudinary widget no está cargado. Verificá app/admin/layout.tsx (Script).");
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        folder: FOLDER,
        resourceType: type === "photo" ? "image" : "video",
        multiple: false,
        sources: ["local", "url", "camera"],
      },
      (err: any, result: any) => {
        if (err) {
          setError("Error subiendo a Cloudinary");
          return;
        }
        if (result && result.event === "success") {
          const info = result.info;
          setUploadedUrl(info.secure_url);
          setUploadedPublicId(info.public_id);
          setUploadedResourceType(info.resource_type);

          if (info.resource_type === "video") {
            setUploadedThumb(info.thumbnail_url || "");
          } else {
            setUploadedThumb("");
          }
        }
      }
    );

    widget.open();
  };

  const resetUpload = () => {
    setUploadedUrl("");
    setUploadedPublicId("");
    setUploadedResourceType("");
    setUploadedThumb("");
  };

  const createMedia = async () => {
    setError(null);

    if (!categoryId) return setError("Elegí una categoría");
    if (!uploadedUrl) return setError("Primero subí un archivo (Cloudinary)");

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        type,
        category: categoryId,
        url: uploadedUrl,
        thumbnail: uploadedThumb || undefined,
        isFeatured,
        publicId: uploadedPublicId || undefined,
        resourceType: uploadedResourceType || undefined,
      };

      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as MediaOneResponse;

      if (!res.ok || !data.ok) {
        setError(!data.ok ? data.error : "Error al crear media");
        return;
      }

      setItems((prev) => [data.item, ...prev]);
      setTitle("");
      setIsFeatured(false);
      resetUpload();
    } catch {
      setError("Error de red al crear media");
    } finally {
      setSaving(false);
    }
  };

  const deleteMedia = async (id: string) => {
    const ok = confirm("¿Borrar este item de media?");
    if (!ok) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { ok: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setError(data.error || "Error al borrar");
        return;
      }

      setItems((prev) => prev.filter((x) => x._id !== id));
    } catch {
      setError("Error de red al borrar");
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
          <h1 className="mt-2 text-2xl font-semibold">Media</h1>
          <p className="mt-1 text-sm text-gray-600">
            Subí fotos y videos a Cloudinary y guardalos en la base.
          </p>
        </div>

        <button
          onClick={() => void loadAll()}
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

      <div className="rounded-2xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Nuevo item</h2>
          <span className="text-xs text-gray-500">{saving ? "Guardando..." : ""}</span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-6">
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Título (opcional)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="Ej: Editorial verano 2026"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "photo" | "video")}
              className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option value="photo">Foto</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Categoría</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option value="">Seleccionar...</option>
              {filteredCategories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              Destacado
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={openWidget}
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
            type="button"
          >
            Subir a Cloudinary
          </button>

          {uploadedUrl && (
            <>
              <span className="text-sm text-gray-700">✅ Archivo subido</span>
              <button
                onClick={resetUpload}
                className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-100"
                type="button"
              >
                Reemplazar
              </button>
            </>
          )}

          <button
            onClick={() => void createMedia()}
            disabled={saving || !uploadedUrl || !categoryId}
            className="ml-auto rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
            type="button"
          >
            Guardar en DB
          </button>
        </div>

        {uploadedUrl && (
          <div className="mt-4 rounded-2xl border bg-gray-50 p-4">
            <div className="text-sm font-medium">Preview</div>
            <div className="mt-3">
              {type === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={uploadedUrl} alt="preview" className="max-h-72 rounded-xl border" />
              ) : (
                <video src={uploadedUrl} controls className="max-h-72 rounded-xl border" />
              )}
            </div>

            <div className="mt-2 text-xs text-gray-600">
              <div>publicId: {uploadedPublicId || "-"}</div>
              <div>resourceType: {uploadedResourceType || "-"}</div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border bg-white p-5">
        <h2 className="text-lg font-medium">Listado</h2>

        {loading ? (
          <p className="mt-4 text-sm text-gray-600">Cargando...</p>
        ) : items.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">No hay media todavía.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((m) => {
              const catName =
                typeof m.category === "string" ? m.category : (m.category?.name ?? "-");

              return (
                <div key={m._id} className="rounded-2xl border bg-white p-3">
                  <div className="text-xs text-gray-500">{catName}</div>
                  <div className="mt-1 text-sm font-medium">{m.title || "(sin título)"}</div>

                  <div className="mt-3 overflow-hidden rounded-xl border bg-gray-50">
                    {m.type === "photo" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.url} alt={m.title || "media"} className="h-48 w-full object-cover" />
                    ) : (
                      <video src={m.url} controls className="h-48 w-full object-cover" />
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-600">{m.isFeatured ? "⭐ Destacado" : ""}</span>

                    <button
                      onClick={() => void deleteMedia(m._id)}
                      disabled={saving}
                      className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
