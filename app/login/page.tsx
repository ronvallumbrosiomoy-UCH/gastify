"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "signup") {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Error al registrarse");
          return;
        }
      }
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Credenciales inválidas");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <div className="bg-apple" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      {/* Floating blobs */}
      <div className="floating-blob blob-green" style={{ width: "300px", height: "300px", top: "80px", left: "40px", animationDelay: "0s" }} />
      <div className="floating-blob blob-purple" style={{ width: "400px", height: "400px", bottom: "80px", right: "40px", animationDelay: "1s" }} />
      <div className="floating-blob blob-blue" style={{ width: "500px", height: "500px", top: "50%", left: "50%", transform: "translate(-50%, -50%)", animationDelay: "2s" }} />

      <div className="animate-fadeIn" style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 10 }}>
        {/* Logo + Heading */}
        <div className="animate-fadeIn" style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", marginBottom: "24px", position: "relative" }}>
            <div className="empty-state-icon empty-state-icon-green" style={{ width: "64px", height: "64px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative", zIndex: 10 }}>
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--gray-900)", marginBottom: "8px" }}>
            Bienvenido a <span className="gradient-text">Gastify</span>
          </h1>
          <p style={{ fontSize: "16px", color: "var(--gray-500)" }}>Tu dinero, tu control.</p>
        </div>

        {/* Card */}
        <div className="card-elevated animate-slideUp" style={{ padding: "32px" }}>
          {/* Segmented Control */}
          <div className="seg-control" style={{ marginBottom: "24px" }}>
            <button onClick={() => { setMode("login"); setError(""); }} className={mode === "login" ? "active" : ""}>
              Iniciar sesión
            </button>
            <button onClick={() => { setMode("signup"); setError(""); }} className={mode === "signup" ? "active" : ""}>
              Registrarse
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="alert-card alert-red animate-slideUp" style={{ marginBottom: "20px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ fontSize: "14px", fontWeight: 500 }}>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="form-group animate-fadeIn">
                <label className="form-label">Nombre</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Tu nombre" required />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="tu@email.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", marginTop: "8px", opacity: loading ? 0.5 : 1 }}>
              {loading ? <span className="spinner" /> : mode === "login" ? "Entrar" : "Crear cuenta"}
            </button>
          </form>

          {/* Divider */}
          <div className="divider" />

          {/* Google */}
          <button onClick={handleGoogle} className="btn-google">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </button>

          {/* Terms */}
          <p style={{ textAlign: "center", fontSize: "12px", color: "var(--gray-500)", marginTop: "24px", lineHeight: 1.6 }}>
            Al continuar, aceptas nuestros{" "}
            <a href="/terminos" style={{ color: "var(--green-600)", fontWeight: 600, textDecoration: "none" }}>Términos</a>{" "}
            y{" "}
            <a href="/privacidad" style={{ color: "var(--green-600)", fontWeight: 600, textDecoration: "none" }}>Privacidad</a>
          </p>
        </div>
      </div>
    </div>
  );
}
