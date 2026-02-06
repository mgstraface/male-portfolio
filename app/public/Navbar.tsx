import Link from "next/link";

export default function Navbar() {
  return (
    <header className="rounded-3xl border bg-white">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="font-semibold tracking-tight">MALE</div>

        <nav className="flex items-center gap-4 text-sm text-gray-700">
          <a href="#galeria" className="hover:underline">
            Galería
          </a>
          <a href="#contacto" className="hover:underline">
            Contacto
          </a>

          <Link
            href="/admin"
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
