"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CATEGORIAS_BASE } from "@/lib/gmail/parsers";

interface Rule {
  _id: string;
  nombre: string;
  condicion: string;
  categoria: string;
  prioridad: number;
  activa: boolean;
}

export default function RulesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");
  const [condicion, setCondicion] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS_BASE[0]);
  const [saving, setSaving] = useState(false);

  const fetchRules = useCallback(async () => {
    const res = await fetch("/api/rules");
    if (res.ok) setRules(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchRules();
  }, [status, router, fetchRules]);

  async function addRule(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, condicion, categoria }),
    });
    setNombre("");
    setCondicion("");
    setSaving(false);
    fetchRules();
  }

  if (status === "loading") {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "160px 0" }}>
        <div className="spinner spinner-dark" style={{ width: "32px", height: "32px" }} />
      </div>
    );
  }
  if (status === "unauthenticated") return null;

  return (
    <div className="animate-fadeIn" style={{ maxWidth: "768px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          <div className="page-icon page-icon-amber">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </div>
          Reglas personalizadas
        </h1>
        <p className="page-subtitle" style={{ marginLeft: "56px" }}>Clasifica gastos como tú quieres. Prioridad sobre la IA.</p>
      </div>

      {/* Form */}
      <div className="card" style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--gray-900)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="kpi-icon kpi-icon-green" style={{ width: "28px", height: "28px" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "14px", height: "14px" }}>
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
          Nueva regla
        </h2>
        <form onSubmit={addRule}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="input" placeholder="Ej: Gastos en Rappi" required />
            </div>
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="input">
                {CATEGORIAS_BASE.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Condición</label>
            <input value={condicion} onChange={(e) => setCondicion(e.target.value)} className="input" placeholder="Ej: monto < 5, comercio contiene rappi" required />
          </div>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ opacity: saving ? 0.5 : 1 }}>
            {saving ? <span className="spinner" /> : "Agregar regla"}
          </button>
        </form>
      </div>

      {/* Rules list */}
      <div className="card" style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--gray-900)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="kpi-icon kpi-icon-purple" style={{ width: "28px", height: "28px" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "14px", height: "14px" }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          Tus reglas ({rules.length})
        </h2>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
            <div className="spinner spinner-dark" style={{ width: "32px", height: "32px" }} />
          </div>
        ) : rules.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "var(--radius-xl)", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <p style={{ color: "var(--gray-500)", fontSize: "14px" }}>Aún no tienes reglas.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {rules.map((r) => (
              <div key={r._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", borderRadius: "var(--radius-lg)", background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.4)", transition: "all 0.2s" }}>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--gray-900)" }}>{r.nombre}</p>
                  <p style={{ fontSize: "13px", color: "var(--gray-500)", marginTop: "2px" }}>
                    Si <span style={{ fontWeight: 500, color: "var(--gray-900)" }}>{r.condicion}</span> → <span style={{ fontWeight: 500, color: "var(--purple-500)" }}>{r.categoria}</span>
                  </p>
                </div>
                <span className="badge">{r.categoria}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
