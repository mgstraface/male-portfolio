"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  _id: string;
  email: string;
  role: "admin";
  createdAt?: string;
};

type UsersRes =
  | { ok: true; users: User[] }
  | { ok: false; error: string };

type UserRes =
  | { ok: true; user: User }
  | { ok: false; error: string };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin">("admin");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      const data = (await res.json()) as UsersRes;
      if (!res.ok || !data.ok) throw new Error(!data.ok ? data.error : "Error users");
      setUsers(data.users);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error cargando usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const createUser = async () => {
    setError(null);
    if (!email.trim()) return setError("Email requerido");
    if (!password.trim() || password.trim().length < 6) return setError("Password mínimo 6 caracteres");

    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: password.trim(), role }),
      });
      const data = (await res.json()) as UserRes;
      if (!res.ok || !data.ok) {
        setError(!data.ok ? data.error : "Error creando usuario");
        return;
      }
      setUsers((prev) => [data.user, ...prev]);
      setEmail("");
      setPassword("");
    } catch {
      setError("Error de red creando usuario");
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (id: string) => {
    const ok = confirm("¿Borrar este usuario?");
    if (!ok) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || "Error borrando usuario");
        return;
      }
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch {
      setError("Error de red borrando usuario");
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
          <h1 className="mt-2 text-2xl font-semibold">Usuarios</h1>
          <p className="mt-1 text-sm text-gray-600">Administrar accesos al dashboard.</p>
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

      <div className="rounded-2xl border bg-white p-5">
        <h2 className="text-lg font-medium">Crear usuario</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-6">
          <div className="md:col-span-3">
            <label className="text-sm font-medium">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="email@dominio.com"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="mínimo 6"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin")}
              className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option value="admin">admin</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => void createUser()}
            disabled={saving}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Crear
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5">
        <h2 className="text-lg font-medium">Listado</h2>

        {loading ? (
          <p className="mt-4 text-sm text-gray-600">Cargando...</p>
        ) : users.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">No hay usuarios.</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {users?.map((u) => (
              <div key={u._id+1} className="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <div className="text-sm font-medium">{u.email}</div>
                  <div className="text-xs text-gray-500">{u.role}</div>
                </div>

                <button
                  onClick={() => void deleteUser(u._id)}
                  disabled={saving}
                  className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
                >
                  Borrar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
