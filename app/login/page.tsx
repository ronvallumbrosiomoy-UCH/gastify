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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mint-brand/50 via-background to-purple-brand/20 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-brand/10 mb-4">
            <span className="text-3xl">💰</span>
          </div>
          <h1 className="text-3xl font-bold text-graphite-brand">Gastify</h1>
          <p className="text-text-secondary mt-2">
            Gastify registra cada gasto por ti.
          </p>
        </div>

        <div className="bg-card border border-card-border rounded-2xl shadow-lg p-8">
          <div className="flex mb-6 rounded-xl bg-surface p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === "login"
                  ? "bg-white shadow text-graphite-brand"
                  : "text-text-secondary"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-white shadow text-graphite-brand"
                  : "text-text-secondary"
              }`}
            >
              Registrarse
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-brand text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-card-border focus:outline-none focus:border-emerald-brand focus:ring-2 focus:ring-emerald-brand/20 bg-background transition-all"
                  placeholder="Tu nombre"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-card-border focus:outline-none focus:border-emerald-brand focus:ring-2 focus:ring-emerald-brand/20 bg-background transition-all"
                placeholder="tu@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-card-border focus:outline-none focus:border-emerald-brand focus:ring-2 focus:ring-emerald-brand/20 bg-background transition-all"
                placeholder="••••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-brand text-white font-medium hover:bg-emerald-brand/90 disabled:opacity-50 transition-all"
            >
              {loading ? "Cargando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-card-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-4 text-text-secondary">
                Continúa con
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogle}
            className="w-full py-3 rounded-xl border border-card-border bg-white hover:bg-surface transition-all flex items-center justify-center gap-3"
          >
            <span className="text-lg">🔴</span>
            <span className="font-medium text-graphite-brand">Google</span>
          </button>

          <p className="text-center text-xs text-text-secondary mt-6">
            Al continuar, aceptas nuestros Términos y Política de Privacidad.
          </p>
        </div>
      </div>
    </div>
  );
}
