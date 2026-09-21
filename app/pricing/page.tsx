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
    <div className="max-w-4xl mx-auto animate-fadeIn relative">
      {/* Decorative elements */}
      <div className="absolute -top-20 left-1/4 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl" />
      <div className="absolute -top-10 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />

      <div className="text-center mb-16 relative z-10">
        <h1 className="text-[40px] font-extrabold tracking-tight text-graphite-brand mb-4">
          Premium
        </h1>
        <p className="text-[18px] text-gray-brand max-w-lg mx-auto">
          Desbloquea el asesor financiero completo con IA.
        </p>
        {cancelled && (
          <div className="mt-6 px-5 py-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-[14px] font-semibold inline-flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            El pago fue cancelado.
          </div>
        )}
      </div>

      {error && (
        <div className="mb-8 px-5 py-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[14px] font-semibold text-center flex items-center justify-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Monthly */}
        <div className="card-elevated p-8 flex flex-col group hover:scale-[1.02] transition-transform duration-300">
          <h2 className="text-[20px] font-bold text-graphite-brand mb-2">Mensual</h2>
          <p className="text-[14px] text-gray-brand mb-6">Perfecto para empezar</p>
          <div className="mb-8">
            <span className="text-[48px] font-extrabold tracking-tight text-graphite-brand">S/ 19.90</span>
            <span className="text-[16px] text-gray-brand ml-1">/mes</span>
          </div>
          <ul className="space-y-4 flex-1 mb-8">
            {[
              { icon: "✓", text: "Registro automático de gastos" },
              { icon: "✓", text: "Insights de IA ilimitados" },
              { icon: "✓", text: "Chat con asesor financiero" },
              { icon: "✓", text: "Alertas por categoría" },
            ].map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-[14px] text-graphite-brand">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                {f.text}
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
        <div className="card-elevated p-8 flex flex-col relative border-2 border-emerald-500 group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="badge px-4 py-2 text-[13px] shadow-xl shadow-emerald-500/30">50% OFF</span>
          </div>
          <h2 className="text-[20px] font-bold text-graphite-brand mb-2">Anual</h2>
          <p className="text-[14px] text-gray-brand mb-6">La mejor oferta</p>
          <div className="mb-2">
            <span className="text-[48px] font-extrabold tracking-tight text-graphite-brand">S/ 9.90</span>
            <span className="text-[16px] text-gray-brand ml-1">/mes</span>
          </div>
          <p className="text-[14px] text-emerald-600 font-semibold mb-8">
            S/ 118.80 al año. Ahorra 50%.
          </p>
          <ul className="space-y-4 flex-1 mb-8">
            {[
              { icon: "✓", text: "Todo lo del plan mensual" },
              { icon: "✓", text: "2 meses gratis" },
              { icon: "✓", text: "Prioridad en soporte" },
              { icon: "✓", text: "Historial ilimitado" },
            ].map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-[14px] text-graphite-brand">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                {f.text}
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

      <p className="text-center text-[14px] text-gray-brand mt-12 relative z-10">
        14 días gratis sin tarjeta. Cancela cuando quieras.
        {session?.user?.role === "premium" && (
          <span className="block mt-3 text-emerald-600 font-bold text-[15px] flex items-center justify-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Ya eres Premium
          </span>
        )}
      </p>
    </div>
  );
}
