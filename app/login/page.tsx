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
    <div className="min-h-screen bg-mesh noise flex items-center justify-center px-4">
      <div className="w-full max-w-[400px] animate-fadeIn">
        {/* Logo + Heading */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20 mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-graphite-brand">
            Bienvenido a Gastify
          </h1>
          <p className="text-[15px] text-gray-brand mt-2">
            Tu dinero, tu control.
          </p>
        </div>

        {/* Card */}
        <div className="card-elevated p-8">
          {/* Segmented Control */}
          <div className="seg-control mb-6">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={mode === "login" ? "active" : ""}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className={mode === "signup" ? "active" : ""}
            >
              Registrarse
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[14px] font-medium animate-slideUp">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="animate-fadeIn">
                <label className="block text-[13px] font-medium text-gray-brand mb-1.5 ml-0.5">
                  Nombre
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="Tu nombre"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-[13px] font-medium text-gray-brand mb-1.5 ml-0.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="tu@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-brand mb-1.5 ml-0.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="spinner" />
              ) : mode === "login" ? (
                "Entrar"
              ) : (
                "Crear cuenta"
              )}
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
          <p className="text-center text-[12px] text-gray-brand mt-5 leading-relaxed">
            Al continuar, aceptas nuestros{" "}
            <a href="/terminos" className="text-emerald-brand hover:underline font-medium">
              Términos
            </a>{" "}
            y{" "}
            <a href="/privacidad" className="text-emerald-brand hover:underline font-medium">
              Política de Privacidad
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
