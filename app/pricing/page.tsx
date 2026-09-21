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

  const cancelled = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("premium") === "cancelled";

  return (
    <div className="animate-fadeIn" style={{ maxWidth: "896px", margin: "0 auto", position: "relative" }}>
      {/* Decorative */}
      <div className="floating-blob blob-green" style={{ width: "300px", height: "300px", top: "-80px", left: "25%" }} />
      <div className="floating-blob blob-purple" style={{ width: "400px", height: "400px", top: "-40px", right: "25%", animationDelay: "1s" }} />

      {/* Header */}
      <div className="page-header" style={{ textAlign: "center", marginBottom: "64px", position: "relative", zIndex: 10 }}>
        <h1 style={{ fontSize: "40px", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--gray-900)", marginBottom: "16px" }}>Premium</h1>
        <p style={{ fontSize: "18px", color: "var(--gray-500)", maxWidth: "512px", margin: "0 auto" }}>Desbloquea el asesor financiero completo con IA.</p>
        {cancelled && (
          <div className="alert-card alert-amber" style={{ display: "inline-flex", marginTop: "24px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span style={{ fontSize: "14px", fontWeight: 600 }}>El pago fue cancelado.</span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="alert-card alert-red" style={{ marginBottom: "32px", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span style={{ fontSize: "14px", fontWeight: 600 }}>{error}</span>
        </div>
      )}

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", position: "relative", zIndex: 10 }}>
        {/* Monthly */}
        <div className="card-elevated pricing-card">
          <h2 className="pricing-card-title">Mensual</h2>
          <p className="pricing-card-subtitle">Perfecto para empezar</p>
          <div className="pricing-price">
            <span className="pricing-amount">S/ 19.90</span>
            <span className="pricing-period">/mes</span>
          </div>
          <ul className="pricing-features">
            {["Registro automático de gastos", "Insights de IA ilimitados", "Chat con asesor financiero", "Alertas por categoría"].map((f) => (
              <li key={f} className="pricing-feature">
                <div className="pricing-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                {f}
              </li>
            ))}
          </ul>
          <button onClick={() => iniciarCheckout("monthly")} disabled={loading === "monthly"} className="btn btn-secondary" style={{ width: "100%", opacity: loading === "monthly" ? 0.5 : 1 }}>
            {loading === "monthly" ? <span className="spinner" /> : "Empezar mensual"}
          </button>
        </div>

        {/* Annual */}
        <div className="card-elevated pricing-card" style={{ border: "2px solid var(--green-500)", position: "relative" }}>
          <div className="pricing-badge">
            <span className="badge" style={{ padding: "8px 16px", fontSize: "13px", boxShadow: "0 8px 24px rgba(16, 185, 129, 0.4)" }}>50% OFF</span>
          </div>
          <h2 className="pricing-card-title">Anual</h2>
          <p className="pricing-card-subtitle">La mejor oferta</p>
          <div className="pricing-price">
            <span className="pricing-amount">S/ 9.90</span>
            <span className="pricing-period">/mes</span>
          </div>
          <p className="pricing-annual-note">S/ 118.80 al año. Ahorra 50%.</p>
          <ul className="pricing-features">
            {["Todo lo del plan mensual", "2 meses gratis", "Prioridad en soporte", "Historial ilimitado"].map((f) => (
              <li key={f} className="pricing-feature">
                <div className="pricing-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                {f}
              </li>
            ))}
          </ul>
          <button onClick={() => iniciarCheckout("annual")} disabled={loading === "annual"} className="btn btn-primary" style={{ width: "100%", opacity: loading === "annual" ? 0.5 : 1 }}>
            {loading === "annual" ? <span className="spinner" /> : "Empezar anual"}
          </button>
        </div>
      </div>

      {/* Footer note */}
      <p style={{ textAlign: "center", fontSize: "14px", color: "var(--gray-500)", marginTop: "48px", position: "relative", zIndex: 10 }}>
        14 días gratis sin tarjeta. Cancela cuando quieras.
        {session?.user?.role === "premium" && (
          <span style={{ display: "block", marginTop: "12px", color: "var(--green-600)", fontWeight: 700, fontSize: "15px" }}>
            ✓ Ya eres Premium
          </span>
        )}
      </p>
    </div>
  );
}
