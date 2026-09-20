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
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-graphite-brand">Hazte Premium</h1>
        <p className="text-text-secondary mt-2">
          Desbloquea el asesor financiero completo con IA.
        </p>
        {cancelled && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 text-amber-brand text-sm">
            El pago fue cancelado. Puedes intentarlo de nuevo cuando quieras.
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-50 text-red-brand text-sm text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Plan mensual */}
        <div className="bg-card border border-card-border rounded-3xl p-8 flex flex-col">
          <h2 className="text-xl font-bold text-graphite-brand">Mensual</h2>
          <p className="text-4xl font-bold text-graphite-brand mt-4">
            S/ 19.90
            <span className="text-base font-normal text-text-secondary">/mes</span>
          </p>
          <ul className="mt-6 space-y-3 flex-1">
            {["Registro automático de gastos", "Insights de IA ilimitados", "Chat con asesor financiero", "Alertas por categoría"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-graphite-brand">
                <span className="text-emerald-brand">✓</span> {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => iniciarCheckout("monthly")}
            disabled={loading === "monthly"}
            className="mt-8 w-full py-3 rounded-xl bg-graphite-brand text-white font-medium hover:bg-graphite-brand/90 disabled:opacity-50 transition-all"
          >
            {loading === "monthly" ? "Procesando..." : "Empezar mensual"}
          </button>
        </div>

        {/* Plan anual */}
        <div className="bg-gradient-to-b from-mint-brand/60 to-purple-brand/10 border-2 border-emerald-brand rounded-3xl p-8 flex flex-col relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-brand text-white text-xs font-bold">
            50% OFF
          </div>
          <h2 className="text-xl font-bold text-graphite-brand">Anual</h2>
          <p className="text-4xl font-bold text-graphite-brand mt-4">
            S/ 9.90
            <span className="text-base font-normal text-text-secondary">/mes</span>
          </p>
          <p className="text-sm text-emerald-brand mt-1">
            Facturado S/ 118.80 al año. Ahorra 50%.
          </p>
          <ul className="mt-6 space-y-3 flex-1">
            {["Todo lo del plan mensual", "2 meses gratis", "Prioridad en soporte", "Historial ilimitado"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-graphite-brand">
                <span className="text-emerald-brand">✓</span> {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => iniciarCheckout("annual")}
            disabled={loading === "annual"}
            className="mt-8 w-full py-3 rounded-xl bg-emerald-brand text-white font-medium hover:bg-emerald-brand/90 disabled:opacity-50 transition-all"
          >
            {loading === "annual" ? "Procesando..." : "Empezar anual"}
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-text-secondary mt-8">
        14 días gratis sin pedir tarjeta. Cancela cuando quieras.
        {session?.user?.role === "premium" && <span className="block mt-2 text-emerald-brand font-medium">✓ Ya eres Premium</span>}
      </p>
    </div>
  );
}