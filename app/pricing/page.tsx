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
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="text-center mb-14">
        <h1 className="text-[36px] font-bold tracking-tight text-graphite-brand">
          Premium
        </h1>
        <p className="text-[17px] text-gray-brand mt-3 max-w-lg mx-auto">
          Desbloquea el asesor financiero completo con IA.
        </p>
        {cancelled && (
          <div className="mt-5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-[14px] font-medium inline-block">
            El pago fue cancelado.
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[14px] text-center font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Monthly */}
        <div className="card-elevated p-8 flex flex-col">
          <h2 className="text-[18px] font-semibold text-graphite-brand">Mensual</h2>
          <div className="mt-5 mb-6">
            <span className="text-[40px] font-bold tracking-tight text-graphite-brand">S/ 19.90</span>
            <span className="text-[15px] text-gray-brand ml-1">/mes</span>
          </div>
          <ul className="space-y-3 flex-1 mb-8">
            {["Registro automático de gastos", "Insights de IA ilimitados", "Chat con asesor financiero", "Alertas por categoría"].map((f) => (
              <li key={f} className="flex items-center gap-3 text-[14px] text-graphite-brand">
                <svg className="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => iniciarCheckout("monthly")}
            disabled={loading === "monthly"}
            className="btn btn-secondary w-full disabled:opacity-50"
          >
            {loading === "monthly" ? <span className="spinner" /> : "Empezar mensual"}
          </button>
        </div>

        {/* Annual */}
        <div className="card-elevated p-8 flex flex-col relative border-2 border-emerald-500">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="badge px-3 py-1 text-[12px]">50% OFF</span>
          </div>
          <h2 className="text-[18px] font-semibold text-graphite-brand">Anual</h2>
          <div className="mt-5 mb-2">
            <span className="text-[40px] font-bold tracking-tight text-graphite-brand">S/ 9.90</span>
            <span className="text-[15px] text-gray-brand ml-1">/mes</span>
          </div>
          <p className="text-[13px] text-emerald-600 font-medium mb-6">
            S/ 118.80 al año. Ahorra 50%.
          </p>
          <ul className="space-y-3 flex-1 mb-8">
            {["Todo lo del plan mensual", "2 meses gratis", "Prioridad en soporte", "Historial ilimitado"].map((f) => (
              <li key={f} className="flex items-center gap-3 text-[14px] text-graphite-brand">
                <svg className="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => iniciarCheckout("annual")}
            disabled={loading === "annual"}
            className="btn btn-primary w-full disabled:opacity-50"
          >
            {loading === "annual" ? <span className="spinner" /> : "Empezar anual"}
          </button>
        </div>
      </div>

      <p className="text-center text-[13px] text-gray-brand mt-10">
        14 días gratis sin tarjeta. Cancela cuando quieras.
        {session?.user?.role === "premium" && (
          <span className="block mt-2 text-emerald-600 font-medium">✓ Ya eres Premium</span>
        )}
      </p>
    </div>
  );
}
