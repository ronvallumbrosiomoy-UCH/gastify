"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null);
  const [error, setError] = useState("");

  async function iniciarCheckout(plan: "monthly" | "annual") {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    setLoading(plan);
    setError("");
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const json = await res.json();
    if (json.url) {
      window.location.href = json.url;
    } else {
      setError(json.error || "Error al iniciar checkout");
      setLoading(null);
    }
  }

  const cancelled =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("premium") === "cancelled";

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-graphite-brand tracking-tight">
          Hazte Premium
        </h1>
        <p className="text-xl text-text-secondary mt-4 max-w-2xl mx-auto">
          Desbloquea el asesor financiero completo con IA.
        </p>
        {cancelled && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 text-sm animate-slideUp">
            El pago fue cancelado. Puedes intentarlo de nuevo cuando quieras.
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm text-center animate-slideUp">
          {error}
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Monthly Plan */}
        <div className="apple-card p-8 flex flex-col">
          <h2 className="text-2xl font-bold text-graphite-brand tracking-tight">Mensual</h2>
          <div className="mt-6">
            <span className="text-5xl font-bold text-graphite-brand tracking-tight">S/ 19.90</span>
            <span className="text-lg text-text-secondary ml-1">/mes</span>
          </div>
          <ul className="mt-8 space-y-4 flex-1">
            {[
              "Registro automático de gastos",
              "Insights de IA ilimitados",
              "Chat con asesor financiero",
              "Alertas por categoría",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3 text-base text-graphite-brand">
                <span className="w-6 h-6 rounded-full bg-emerald-brand/10 flex items-center justify-center">
                  <span className="text-emerald-brand text-sm">✓</span>
                </span>
                {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => iniciarCheckout("monthly")}
            disabled={loading === "monthly"}
            className="apple-button apple-button-secondary w-full mt-8"
          >
            {loading === "monthly" ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-graphite-brand/30 border-t-graphite-brand rounded-full animate-spin" />
                Procesando...
              </span>
            ) : (
              "Empezar mensual"
            )}
          </button>
        </div>

        {/* Annual Plan */}
        <div className="apple-card p-8 flex flex-col relative border-2 border-emerald-brand bg-gradient-to-b from-emerald-brand/5 to-transparent">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-emerald-brand text-white text-sm font-bold shadow-md">
            50% OFF
          </div>
          <h2 className="text-2xl font-bold text-graphite-brand tracking-tight">Anual</h2>
          <div className="mt-6">
            <span className="text-5xl font-bold text-graphite-brand tracking-tight">S/ 9.90</span>
            <span className="text-lg text-text-secondary ml-1">/mes</span>
          </div>
          <p className="text-sm text-emerald-brand mt-2 font-medium">
            Facturado S/ 118.80 al año. Ahorra 50%.
          </p>
          <ul className="mt-8 space-y-4 flex-1">
            {[
              "Todo lo del plan mensual",
              "2 meses gratis",
              "Prioridad en soporte",
              "Historial ilimitado",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3 text-base text-graphite-brand">
                <span className="w-6 h-6 rounded-full bg-emerald-brand/10 flex items-center justify-center">
                  <span className="text-emerald-brand text-sm">✓</span>
                </span>
                {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => iniciarCheckout("annual")}
            disabled={loading === "annual"}
            className="apple-button apple-button-primary w-full mt-8"
          >
            {loading === "annual" ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Procesando...
              </span>
            ) : (
              "Empezar anual"
            )}
          </button>
        </div>
      </div>

      {/* Footer Note */}
      <p className="text-center text-sm text-text-secondary mt-12">
        14 días gratis sin pedir tarjeta. Cancela cuando quieras.
        {session?.user?.role === "premium" && (
          <span className="block mt-3 text-emerald-brand font-semibold text-base">
            ✓ Ya eres Premium
          </span>
        )}
      </p>
    </div>
  );
}
