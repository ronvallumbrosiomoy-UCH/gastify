"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/transactions", label: "Transacciones", icon: "💳" },
    { href: "/rules", label: "Reglas", icon: "⚡" },
    { href: "/chat", label: "Asesor IA", icon: "🤖" },
    { href: "/pricing", label: "Premium", icon: "⭐" },
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-brand to-emerald-brand/80 flex items-center justify-center shadow-md">
                <span className="text-xl font-bold text-white">G</span>
              </div>
              <span className="text-xl font-semibold text-graphite-brand hidden sm:inline tracking-tight">
                Gastify
              </span>
            </Link>

            {/* Navigation Links */}
            {session?.user && (
              <div className="hidden md:flex items-center gap-1 bg-white/50 rounded-2xl p-1 border border-white/20">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      pathname === l.href
                        ? "bg-white text-emerald-brand shadow-sm"
                        : "text-text-secondary hover:text-graphite-brand hover:bg-white/50"
                    }`}
                  >
                    <span className="text-base">{l.icon}</span>
                    <span className="hidden lg:inline">{l.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {session?.user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-white/20">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-brand to-mint-brand flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {session.user.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-graphite-brand">
                    {session.user.name}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-card-border hover:bg-red-50 hover:border-red-200 hover:text-red-brand transition-all"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="apple-button apple-button-primary text-sm"
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
