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
    { href: "/pricing", label: "Premium" },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-black/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-500/20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="text-[17px] font-semibold tracking-tight text-graphite-brand hidden sm:block">
              Gastify
            </span>
          </Link>

          {/* Nav Links — centered pills */}
          {session?.user && (
            <div className="hidden md:flex items-center gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3.5 py-2 rounded-lg text-[14px] font-medium transition-all duration-150 ${
                    pathname === l.href
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-brand hover:text-graphite-brand hover:bg-black/[0.03]"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {session?.user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-[13px] font-semibold shadow-sm">
                    {session.user.name?.charAt(0) || "U"}
                  </div>
                  <span className="text-[14px] font-medium text-graphite-brand">
                    {session.user.name}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="btn btn-ghost h-9 px-3 text-[13px]"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn btn-primary h-9 px-4 text-[13px]">
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
