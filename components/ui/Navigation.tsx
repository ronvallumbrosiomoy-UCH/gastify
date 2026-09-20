"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/transactions", label: "Transacciones" },
    { href: "/rules", label: "Reglas" },
    { href: "/chat", label: "Asesor IA" },
    { href: "/pricing", label: "⭐ Premium" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-emerald-brand">G</span>
              <span className="text-xl font-semibold text-graphite-brand hidden sm:inline">
                Gastify
              </span>
            </Link>

            {session?.user && (
              <div className="hidden sm:flex items-center gap-1">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                      pathname === l.href
                        ? "bg-emerald-brand/10 text-emerald-brand font-medium"
                        : "text-text-secondary hover:text-graphite-brand"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {session?.user ? (
              <>
                <span className="text-sm text-text-secondary hidden sm:inline">
                  {session.user.name}
                </span>
                <button
                  onClick={() => signOut()}
                  className="px-3 py-1.5 text-sm rounded-full border border-gray-200 hover:bg-red-brand/10 hover:border-red-brand/30 hover:text-red-brand transition-all"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium rounded-full bg-emerald-brand text-white hover:bg-emerald-brand/90 transition-all"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}