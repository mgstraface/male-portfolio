import LogoutButton from "./logout-button";

type MeResponse =
  | { ok: true; user: { id: string; email: string; role: string } }
  | { ok: false; error: string };

async function getMe(): Promise<MeResponse> {
  // IMPORTANTE: en Server Component, el cookie viaja solo
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/auth/me`, {
    cache: "no-store",
  });

  // Si estás en dev y sin NEXT_PUBLIC_BASE_URL, esto puede fallar en SSR.
  // Alternativa más segura abajo (usando headers()).
  return res.json();
}

export default async function AdminHomePage() {
  // ✅ alternativa robusta (sin BASE_URL): llamar al endpoint con fetch relativo NO anda en server
  // así que mejor leemos directamente el endpoint con headers() + fetch absoluto
  // Para simplificar, usamos un approach directo: render “shell” y el client hace /api/auth/me
  // PERO como ya tenés middleware, acá podemos mostrar algo simple.

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <LogoutButton />
      </div>

      <div className="rounded-2xl border bg-white p-5">
        <p className="text-sm text-gray-600">
          ✅ Entraste al Admin. Ahora armamos las secciones: Categorías, Media, Mensajes y Usuarios.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href="/admin/categories"
          className="rounded-2xl border bg-white p-5 hover:bg-gray-50"
        >
          <div className="text-lg font-medium">Categorías</div>
          <div className="text-sm text-gray-600">Crear/editar categorías de fotos y videos</div>
        </a>

        <a href="/admin/media" className="rounded-2xl border bg-white p-5 hover:bg-gray-50">
          <div className="text-lg font-medium">Media</div>
          <div className="text-sm text-gray-600">Subir / editar fotos y videos</div>
        </a>

        <a
          href="/admin/messages"
          className="rounded-2xl border bg-white p-5 hover:bg-gray-50"
        >
          <div className="text-lg font-medium">Mensajes</div>
          <div className="text-sm text-gray-600">Ver contactos del formulario</div>
        </a>

        <a href="/admin/users" className="rounded-2xl border bg-white p-5 hover:bg-gray-50">
          <div className="text-lg font-medium">Usuarios</div>
          <div className="text-sm text-gray-600">Administrar accesos</div>
        </a>
      </div>
    </div>
  );
}
