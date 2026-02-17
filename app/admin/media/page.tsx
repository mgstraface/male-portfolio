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

type UploadItem = {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
  thumbnail?: string;
  originalFilename?: string;
};

type MediaItem = {
  _id: string;

  // legacy
  title?: string;

  // ✅ projects
  album?: string | null;
  name?: string;
  description?: string;

  // ✅ NEW
  esPortada?: boolean;

  type: "photo" | "video";
  category: Category | string;
  url: string;
  thumbnail?: string;
  isFeatured: boolean;
  publicId?: string;
  resourceType?: "image" | "video";
  fullVideoUrl?: string;
  createdAt?: string;
};

type CategoriesResponse = { ok: true; categories: Category[] } | { ok: false; error: string };
type MediaListResponse = { ok: true; items: MediaItem[] } | { ok: false; error: string };
type MediaOneResponse = { ok: true; item: MediaItem } | { ok: false; error: string };

export default function AdminMediaPage() {
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";
  const BASE_FOLDER = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || "male-portfolio";

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form
  const [type, setType] = useState<"photo" | "video">("photo");
  const [categoryId, setCategoryId] = useState<string>("");

  // legacy title
  const [title, setTitle] = useState("");

  // ✅ projects fields
  const [album, setAlbum] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [isFeatured, setIsFeatured] = useState(false);
  const [fullVideoUrl, setFullVideoUrl] = useState("");

  // multiple uploads
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  // inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // ✅ projects inline edit
  const [editAlbum, setEditAlbum] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [editFeatured, setEditFeatured] = useState(false);
  const [editFullVideoUrl, setEditFullVideoUrl] = useState("");

  // ✅ Portada SOLO en edición
  const [editEsPortada, setEditEsPortada] = useState(false);

  // ✅ FILTERS
  const [q, setQ] = useState("");
  const [filterType, setFilterType] = useState<"all" | "photo" | "video">("all");
  const [filterCategoryId, setFilterCategoryId] = useState<string>("all");

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => c.active && c.type === type);
  }, [categories, type]);

  const selectedCategoryName = useMemo(() => {
    return categories.find((c) => c._id === categoryId)?.name || "sin-categoria";
  }, [categories, categoryId]);

  // ✅ detectar Projects por nombre de categoría
  const isProjectsCategory = useMemo(() => {
    const n = selectedCategoryName.toLowerCase().trim();
    return n === "projects" || n === "project";
  }, [selectedCategoryName]);

  const safeCategory = useMemo(() => {
    return selectedCategoryName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "");
  }, [selectedCategoryName]);

  const folder = useMemo(() => {
    return `${BASE_FOLDER}/${type === "photo" ? "photos" : "videos"}/${safeCategory}`;
  }, [BASE_FOLDER, type, safeCategory]);

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

    setUploads([]);
    setFullVideoUrl("");

    // reset de campos
    setTitle("");
    setAlbum("");
    setName("");
    setDescription("");
    setIsFeatured(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const openWidget = () => {
    setError(null);

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setError("Faltan NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME / NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET");
      return;
    }
    if (!categoryId) {
      setError("Elegí una categoría antes de subir");
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
        folder,
        multiple: true,
        maxFiles: 50,
        sources: ["local", "url", "camera"],
        resourceType: "auto",
      },
      (err: any, result: any) => {
        if (err) {
          console.error(err);
          setError("Error subiendo a Cloudinary");
          return;
        }

        if (result && result.event === "success") {
          const info = result.info;

          const newItem: UploadItem = {
            url: info.secure_url,
            publicId: info.public_id,
            resourceType: info.resource_type,
            thumbnail: info.thumbnail_url || "",
            originalFilename: info.original_filename || "",
          };

          setUploads((prev) => [newItem, ...prev]);
        }
      }
    );

    widget.open();
  };

  const resetUploads = () => setUploads([]);

  const createMediaBatch = async () => {
    setError(null);

    if (!categoryId) return setError("Elegí una categoría");
    if (uploads.length === 0) return setError("Primero subí archivos (Cloudinary)");

    if (type === "video" && fullVideoUrl.trim() && !/^https?:\/\//i.test(fullVideoUrl.trim())) {
      return setError("El link del video completo debe empezar con http:// o https://");
    }

    // ✅ validación projects (exigimos Album/Name/Desc)
    if (isProjectsCategory) {
      if (!album.trim()) return setError("Para Projects, completá el Album");
      if (!name.trim()) return setError("Para Projects, completá el Name");
      if (!description.trim()) return setError("Para Projects, completá la Description");
    }

    setSaving(true);
    try {
      const results = await Promise.all(
        uploads.map(async (u) => {
          const payload: any = {
            // legacy
            title: title.trim() || u.originalFilename || "",

            // ✅ projects
            album: album.trim() || undefined,
            name: isProjectsCategory ? name.trim() : undefined,
            description: isProjectsCategory ? description.trim() : undefined,

            // ✅ IMPORTANTE:
            // NO seteamos portada al crear batch (se elige luego editando)
            // esPortada: undefined

            type,
            category: categoryId,
            url: u.url,
            thumbnail: u.resourceType === "video" ? (u.thumbnail || "") : "",
            isFeatured,
            publicId: u.publicId,
            resourceType: u.resourceType,
            fullVideoUrl: type === "video" ? (fullVideoUrl.trim() || undefined) : undefined,
          };

          const res = await fetch("/api/media", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const data = (await res.json()) as MediaOneResponse;
          if (!res.ok || !data.ok) throw new Error(!data.ok ? data.error : "Error al crear media");
          return data.item;
        })
      );

      setItems((prev) => [...results, ...prev]);

      // reset
      setTitle("");
      setAlbum("");
      setName("");
      setDescription("");
      setIsFeatured(false);
      setFullVideoUrl("");
      resetUploads();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar en DB");
    } finally {
      setSaving(false);
    }
  };

  const deleteAlbum = async (albumName: string) => {
    const ok = confirm(`¿Borrar el ALBUM COMPLETO "${albumName}"?\nEsto elimina TODO (DB + Cloudinary).`);
    if (!ok) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/media/projects/${encodeURIComponent(albumName)}/delete`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { ok: boolean; error?: string; deleted?: number };

      if (!res.ok || !data.ok) {
        setError(data.error || "Error al borrar álbum");
        return;
      }

      setItems((prev) =>
        prev.filter((x) => {
          const catName = typeof x.category === "string" ? "" : ((x.category as any)?.name ?? "");
          const isProj = catName.toLowerCase().trim() === "projects" || catName.toLowerCase().trim() === "project";
          if (!isProj) return true;
          return (x.album || "") !== albumName;
        })
      );
    } catch {
      setError("Error de red al borrar álbum");
    } finally {
      setSaving(false);
    }
  };

  const deleteMedia = async (mOrId: string | MediaItem) => {
    const m = typeof mOrId === "string" ? items.find((x) => x._id === mOrId) : mOrId;
    const id = typeof mOrId === "string" ? mOrId : mOrId._id;

    if (!m) {
      const ok = confirm("¿Borrar este item de media? (DB + Cloudinary)");
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
      return;
    }

    const catName = typeof m.category === "string" ? m.category : ((m.category as any)?.name ?? "");
    const thisIsProjects =
      catName.toLowerCase().trim() === "projects" || catName.toLowerCase().trim() === "project";

    const hasAlbum = thisIsProjects && !!m.album?.trim();

    if (hasAlbum) {
      const choice = prompt(
        `Este item pertenece al álbum: "${m.album}".\n\n` +
          `Escribí:\n` +
          `  1 = Borrar SOLO este item\n` +
          `  2 = Borrar ALBUM COMPLETO\n\n` +
          `Cancelar = no borrar`,
        "1"
      );

      if (!choice) return;

      if (choice.trim() === "2") {
        await deleteAlbum(m.album!.trim());
        return;
      }

      if (choice.trim() !== "1") return;
    } else {
      const ok = confirm("¿Borrar este item de media? (DB + Cloudinary)");
      if (!ok) return;
    }

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

  const startEdit = (m: MediaItem) => {
    setEditingId(m._id);

    // legacy
    setEditTitle(m.title || "");

    // ✅ projects
    setEditAlbum((m.album as any) || "");
    setEditName(m.name || "");
    setEditDescription(m.description || "");

    setEditFeatured(!!m.isFeatured);
    setEditFullVideoUrl(m.fullVideoUrl || "");

    // ✅ portada (solo edición)
    setEditEsPortada(!!m.esPortada);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditAlbum("");
    setEditName("");
    setEditDescription("");
    setEditFeatured(false);
    setEditFullVideoUrl("");
    setEditEsPortada(false);
  };

  const saveEdit = async (id: string) => {
    setError(null);

    if (editFullVideoUrl.trim() && !/^https?:\/\//i.test(editFullVideoUrl.trim())) {
      setError("El link del video completo debe empezar con http:// o https://");
      return;
    }

    const current = items.find((x) => x._id === id);
    const currentCatName = current && typeof current.category !== "string" ? (current.category?.name ?? "") : "";
    const currentIsProjects =
      (currentCatName || "").toLowerCase().trim() === "projects" ||
      (currentCatName || "").toLowerCase().trim() === "project";

    if (currentIsProjects) {
      if (!editAlbum.trim()) return setError("Para Projects, el Album no puede estar vacío");
      if (!editName.trim()) return setError("Para Projects, el Name no puede estar vacío");
      if (!editDescription.trim()) return setError("Para Projects, la Description no puede estar vacía");
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // legacy
          title: editTitle.trim(),

          // ✅ projects
          album: currentIsProjects ? editAlbum.trim() : undefined,
          name: currentIsProjects ? editName.trim() : undefined,
          description: currentIsProjects ? editDescription.trim() : undefined,

          // ✅ portada SOLO acá
          esPortada: currentIsProjects ? editEsPortada : undefined,

          isFeatured: editFeatured,
          fullVideoUrl: editFullVideoUrl.trim(),
        }),
      });

      const data = (await res.json()) as MediaOneResponse;

      if (!res.ok || !data.ok) {
        setError(!data.ok ? data.error : "Error al guardar");
        return;
      }

      setItems((prev) => prev.map((x) => (x._id === id ? data.item : x)));
      cancelEdit();
    } catch {
      setError("Error de red al guardar");
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((m) => {
      if (filterType !== "all" && m.type !== filterType) return false;

      if (filterCategoryId !== "all") {
        const catId = typeof m.category === "string" ? m.category : (m.category as any)?._id;
        if (catId !== filterCategoryId) return false;
      }

      if (!needle) return true;

      const catName = typeof m.category === "string" ? "" : ((m.category as any)?.name ?? "");
      const haystack = [
        m.title ?? "",
        m.album ?? "",
        m.name ?? "",
        m.description ?? "",
        catName,
        m.url ?? "",
        m.publicId ?? "",
        m.fullVideoUrl ?? "",
        m.esPortada ? "portada" : "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [items, q, filterType, filterCategoryId]);

  const clearFilters = () => {
    setQ("");
    setFilterType("all");
    setFilterCategoryId("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm text-gray-600 hover:underline">
            ← Volver
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">Media</h1>
          <p className="mt-1 text-sm text-gray-600">Subí fotos y videos (teasers) a Cloudinary y guardalos en la base.</p>
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
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* CREATE */}
      <div className="rounded-2xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Nueva carga</h2>
          <span className="text-xs text-gray-500">{saving ? "Guardando..." : ""}</span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-6">
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Título base (opcional)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="Ej: Sesión verano 2026 (si lo dejás vacío usa el nombre del archivo)"
            />
            {isProjectsCategory && (
              <p className="mt-1 text-xs text-gray-500">
                En <b>Projects</b> se requiere <b>Album + Name + Description</b>.
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "photo" | "video")}
              className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option value="photo">Foto</option>
              <option value="video">Video (teaser)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Categoría</label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setUploads([]);
              }}
              className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option value="">Seleccionar...</option>
              {filteredCategories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Subidas irán a: <span className="font-mono">{folder}</span>
            </p>
          </div>

          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              Destacado
            </label>
          </div>

          {type === "video" && (
            <div className="md:col-span-6">
              <label className="text-sm font-medium">Link a video completo (YouTube, etc.)</label>
              <input
                value={fullVideoUrl}
                onChange={(e) => setFullVideoUrl(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="https://youtube.com/watch?v=... (opcional)"
              />
            </div>
          )}

          {isProjectsCategory && (
            <>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Album (obligatorio)</label>
                <input
                  value={album}
                  onChange={(e) => setAlbum(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
                  placeholder="Ej: sesion1 / boda-abril / editorial-2026..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Tip: usá un nombre consistente: <span className="font-mono">boda-abril-2026</span>
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Name (Project)</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
                  placeholder="Ej: Editorial Verano / Boda / Campaña..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200 min-h-[44px]"
                  placeholder="Breve descripción del proyecto..."
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={openWidget}
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
            type="button"
          >
            Subir {type === "photo" ? "fotos" : "teasers"} a Cloudinary (multi)
          </button>

          {uploads.length > 0 && (
            <>
              <span className="text-sm text-gray-700">✅ Subidos: {uploads.length}</span>
              <button onClick={resetUploads} className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-100" type="button">
                Limpiar
              </button>
            </>
          )}

          <button
            onClick={() => void createMediaBatch()}
            disabled={saving || uploads.length === 0 || !categoryId}
            className="ml-auto rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
            type="button"
          >
            Guardar en DB ({uploads.length || 0})
          </button>
        </div>

        {uploads.length > 0 && (
          <div className="mt-4 rounded-2xl border bg-gray-50 p-4">
            <div className="text-sm font-medium">Preview subidos</div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {uploads.map((u) => (
                <div key={u.publicId} className="rounded-xl border bg-white p-2">
                  <div className="text-xs text-gray-500 truncate">{u.originalFilename || u.publicId}</div>
                  <div className="mt-2 overflow-hidden rounded-lg border bg-gray-50">
                    {u.resourceType === "image" ? (
                      <img src={u.url} alt="preview" className="h-40 w-full object-cover" />
                    ) : (
                      <video src={u.url} controls className="h-40 w-full object-cover" />
                    )}
                  </div>
                  <div className="mt-2 text-[11px] text-gray-600">
                    <div className="truncate">publicId: {u.publicId}</div>
                    <div>resourceType: {u.resourceType}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* LIST */}
      <div className="rounded-2xl border bg-white p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-medium">Listado</h2>
            <p className="mt-1 text-xs text-gray-500">
              Mostrando {filteredItems.length} de {items.length}
            </p>
          </div>

          <div className="grid gap-2 md:grid-cols-4 md:items-end">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600">Buscar</label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="Título, album, name/description, categoría, url/publicId..."
              />
            </div>

            <div>
              <label className="text-xs text-gray-600">Tipo</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option value="all">Todos</option>
                <option value="photo">Fotos</option>
                <option value="video">Videos</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600">Categoría</label>
              <select
                value={filterCategoryId}
                onChange={(e) => setFilterCategoryId(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option value="all">Todas</option>
                {categories
                  .filter((c) => c.active)
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.type})
                    </option>
                  ))}
              </select>
            </div>

            <button
              onClick={clearFilters}
              className="md:col-span-4 rounded-xl border px-3 py-2 text-sm hover:bg-gray-100"
              type="button"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-gray-600">Cargando...</p>
        ) : filteredItems.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">No hay resultados.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((m) => {
              const catName = typeof m.category === "string" ? m.category : ((m.category as any)?.name ?? "-");
              const isEditing = editingId === m._id;
              const thisIsProjects =
                catName.toLowerCase().trim() === "projects" || catName.toLowerCase().trim() === "project";

              return (
                <div key={m._id} className="rounded-2xl border bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-gray-500">{catName}</div>
                    {!isEditing && thisIsProjects && m.esPortada && (
                      <span className="text-xs text-gray-700">🖼️ Portada</span>
                    )}
                  </div>

                  {!isEditing ? (
                    <>
                      <div className="mt-1 text-sm font-medium">
                        {thisIsProjects ? m.name || "(sin name)" : m.title || "(sin título)"}
                      </div>

                      {thisIsProjects && m.album && (
                        <div className="mt-1 text-xs text-gray-600">
                          Album: <span className="font-mono">{m.album}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {!thisIsProjects && (
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="mt-2 w-full rounded-lg border px-2 py-1 text-sm"
                          placeholder="Título"
                        />
                      )}

                      {thisIsProjects && (
                        <>
                          <input
                            value={editAlbum}
                            onChange={(e) => setEditAlbum(e.target.value)}
                            className="mt-2 w-full rounded-lg border px-2 py-1 text-sm"
                            placeholder="Album (obligatorio)"
                          />
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="mt-2 w-full rounded-lg border px-2 py-1 text-sm"
                            placeholder="Name (Project)"
                          />
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="mt-2 w-full rounded-lg border px-2 py-1 text-sm min-h-[60px]"
                            placeholder="Description"
                          />

                          <label className="mt-2 flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={editEsPortada}
                              onChange={(e) => setEditEsPortada(e.target.checked)}
                            />
                            Es portada
                          </label>
                        </>
                      )}
                    </>
                  )}

                  {!isEditing && thisIsProjects && m.description && (
                    <p className="mt-1 text-sm text-gray-600 line-clamp-3">{m.description}</p>
                  )}

                  <div className="mt-3 overflow-hidden rounded-xl border bg-gray-50">
                    {m.type === "photo" ? (
                      <img src={m.url} alt={m.title || m.name || "media"} className="h-48 w-full object-cover" />
                    ) : (
                      <video src={m.url} controls className="h-48 w-full object-cover" />
                    )}
                  </div>

                  {m.type === "video" && !isEditing && m.fullVideoUrl && (
                    <a
                      className="mt-2 block text-sm text-blue-600 hover:underline"
                      href={m.fullVideoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver video completo
                    </a>
                  )}

                  {m.type === "video" && isEditing && (
                    <div className="mt-2">
                      <label className="text-xs text-gray-600">
                        {thisIsProjects ? "Link externo (Ver proyecto)" : "Link video completo"}
                      </label>
                      <input
                        value={editFullVideoUrl}
                        onChange={(e) => setEditFullVideoUrl(e.target.value)}
                        className="mt-1 w-full rounded-lg border px-2 py-1 text-sm"
                        placeholder="https://..."
                      />
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    {!isEditing ? (
                      <span className="text-xs text-gray-600">{m.isFeatured ? "⭐ Destacado" : ""}</span>
                    ) : (
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={editFeatured} onChange={(e) => setEditFeatured(e.target.checked)} />
                          Destacado
                        </label>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {!isEditing ? (
                        <>
                          <button
                            onClick={() => startEdit(m)}
                            disabled={saving}
                            className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => void deleteMedia(m)}
                            disabled={saving}
                            className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
                          >
                            Borrar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => void saveEdit(m._id)}
                            disabled={saving}
                            className="rounded-lg bg-emerald-600 px-2 py-1 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={saving}
                            className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] text-gray-600">
                    <div className="truncate">publicId: {m.publicId || "-"}</div>
                    <div>resourceType: {m.resourceType || "-"}</div>
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
