"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CATEGORIAS_BASE } from "@/lib/gmail/parsers";

interface Transaction {
  _id: string;
  monto: number;
  comercio: string;
  categoria: string;
  fecha: string;
  moneda: string;
  banco?: string;
  ultimos4?: string;
  tipo: string;
}

const fmtSoles = (n: number) =>
  "S/ " + n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtFecha = (d: string) =>
  new Date(d).toLocaleDateString("es-PE", { day: "2-digit", month: "short" });

export default function TransactionsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaFilter, setCategoriaFilter] = useState("");
  const [editingCat, setEditingCat] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    const res = await fetch(`/api/transactions${categoriaFilter ? `?categoria=${categoriaFilter}` : ""}`);
    if (res.ok) {
      setTransactions(await res.json());
    }
    setLoading(false);
  }, [categoriaFilter]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchTransactions();
  }, [status, router, fetchTransactions]);

  async function updateCategoria(id: string, categoria: string) {
    await fetch(`/api/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoria }),
    });
    fetchTransactions();
    setEditingCat(null);
  }

  async function deleteTransaction(id: string) {
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    fetchTransactions();
  }

  if (status === "loading") {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "160px 0" }}>
        <div className="spinner spinner-dark" style={{ width: "32px", height: "32px" }} />
      </div>
    );
  }
  if (status === "unauthenticated") return null;

  const total = transactions
    .filter((t) => t.tipo === "gasto")
    .reduce((s, t) => s + t.monto, 0);

  return (
    <div className="animate-fadeIn" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div className="page-header" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px" }}>
        <div>
          <h1 className="page-title">Transacciones</h1>
          <p className="page-subtitle">Tus gastos detectados automáticamente.</p>
        </div>
        <div className="kpi" style={{ padding: "16px 24px", display: "inline-flex", flexDirection: "column", alignItems: "flex-end" }}>
          <p className="kpi-label" style={{ marginBottom: "4px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total gastos</p>
          <p className="kpi-value" style={{ fontSize: "24px" }}>{fmtSoles(total)}</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        <button onClick={() => setCategoriaFilter("")} className={`filter-chip ${!categoriaFilter ? "filter-chip-active" : "filter-chip-inactive"}`}>
          Todas
        </button>
        {CATEGORIAS_BASE.map((c) => (
          <button key={c} onClick={() => setCategoriaFilter(categoriaFilter === c ? "" : c)} className={`filter-chip ${categoriaFilter === c ? "filter-chip-active" : "filter-chip-inactive"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "128px 0" }}>
          <div className="spinner spinner-dark" style={{ width: "32px", height: "32px" }} />
        </div>
      ) : transactions.length === 0 ? (
        <div className="card-elevated empty-state animate-scaleIn">
          <div className="empty-state-icon empty-state-icon-purple">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative", zIndex: 10 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <h2>Sin transacciones</h2>
          <p>Conecta tu Gmail o usa &quot;Sincronizar&quot; para detectar gastos.</p>
        </div>
      ) : (
        <div className="table-container">
          <table style={{ width: "100%", fontSize: "14px" }}>
            <thead>
              <tr className="table-header">
                <th>Fecha</th>
                <th>Comercio</th>
                <th>Categoría</th>
                <th style={{ textAlign: "right" }}>Monto</th>
                <th>Banco</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id} className="table-row">
                  <td style={{ color: "var(--gray-500)" }}>{fmtFecha(t.fecha)}</td>
                  <td style={{ fontWeight: 600, color: "var(--gray-900)" }}>{t.comercio}</td>
                  <td>
                    {editingCat === t._id ? (
                      <select value={t.categoria} onChange={(e) => updateCategoria(t._id, e.target.value)} onBlur={() => setEditingCat(null)} autoFocus className="input" style={{ height: "32px", padding: "0 8px", fontSize: "13px", width: "128px" }}>
                        {CATEGORIAS_BASE.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      <button onClick={() => setEditingCat(t._id)} className="badge badge-purple" style={{ fontSize: "12px", padding: "4px 10px" }}>
                        {t.categoria}
                      </button>
                    )}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                    {t.tipo === "ingreso" ? "+" : "-"}{fmtSoles(t.monto)}
                  </td>
                  <td style={{ color: "var(--gray-500)" }}>{t.banco || "—"}</td>
                  <td>
                    <button onClick={() => deleteTransaction(t._id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)", transition: "color 0.2s" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
