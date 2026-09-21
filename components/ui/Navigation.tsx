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
    <nav className="nav">
      <div className="nav-inner">
        {/* Logo */}
        <Link href="/" className="nav-logo">
          <div className="nav-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="nav-logo-text">Gastify</span>
        </Link>

        {/* Nav Links */}
        {session?.user && (
          <div className="nav-links">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link ${pathname === l.href ? "nav-link-active" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="nav-user">
          {session?.user ? (
            <>
              <div className="nav-avatar">
                <div className="nav-avatar-circle">
                  {session.user.name?.charAt(0) || "U"}
                </div>
                <span className="nav-avatar-name">{session.user.name}</span>
              </div>
              <button onClick={() => signOut()} className="btn btn-ghost" style={{ height: "36px", padding: "0 12px", fontSize: "13px" }}>
                Salir
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary" style={{ height: "36px", padding: "0 16px", fontSize: "13px" }}>
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
