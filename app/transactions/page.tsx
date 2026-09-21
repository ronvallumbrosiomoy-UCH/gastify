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
    const res = await fetch(
      `/api/transactions${categoriaFilter ? `?categoria=${categoriaFilter}` : ""}`
    );
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
      <div className="flex items-center justify-center py-40">
        <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }
  if (status === "unauthenticated") return null;

  const total = transactions
    .filter((t) => t.tipo === "gasto")
    .reduce((s, t) => s + t.monto, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-tight text-graphite-brand">
            Transacciones
          </h1>
          <p className="text-[16px] text-gray-brand mt-1">
            Tus gastos detectados automáticamente.
          </p>
        </div>
        <div className="kpi px-6 py-4 inline-flex flex-col items-end">
          <p className="text-[12px] font-semibold text-gray-brand uppercase tracking-wider">Total gastos</p>
          <p className="text-[24px] font-extrabold tracking-tight text-graphite-brand">
            {fmtSoles(total)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoriaFilter("")}
          className={`h-10 px-4 rounded-xl text-[14px] font-semibold transition-all duration-200 ${
            !categoriaFilter
              ? "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-lg shadow-emerald-500/25"
              : "bg-white/60 text-gray-brand hover:bg-white hover:text-graphite-brand border border-white/40"
          }`}
        >
          Todas
        </button>
        {CATEGORIAS_BASE.map((c) => (
          <button
            key={c}
            onClick={() => setCategoriaFilter(categoriaFilter === c ? "" : c)}
            className={`h-10 px-4 rounded-xl text-[14px] font-semibold transition-all duration-200 ${
              categoriaFilter === c
                ? "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                : "bg-white/60 text-gray-brand hover:bg-white hover:text-graphite-brand border border-white/40"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="card-elevated p-16 text-center animate-scaleIn">
          <div className="illustration inline-flex mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/30 relative z-10">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
          </div>
          <h2 className="text-[24px] font-extrabold tracking-tight text-graphite-brand mb-3">
            Sin transacciones
          </h2>
          <p className="text-[16px] text-gray-brand max-w-sm mx-auto">
            Conecta tu Gmail o usa &quot;Sincronizar&quot; para detectar gastos.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="text-left px-6 py-4 text-[12px] font-bold text-gray-brand uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-6 py-4 text-[12px] font-bold text-gray-brand uppercase tracking-wider">Comercio</th>
                  <th className="text-left px-6 py-4 text-[12px] font-bold text-gray-brand uppercase tracking-wider">Categoría</th>
                  <th className="text-right px-6 py-4 text-[12px] font-bold text-gray-brand uppercase tracking-wider">Monto</th>
                  <th className="text-left px-6 py-4 text-[12px] font-bold text-gray-brand uppercase tracking-wider">Banco</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id} className="table-row">
                    <td className="px-6 py-4 text-gray-brand">{fmtFecha(t.fecha)}</td>
                    <td className="px-6 py-4 font-semibold text-graphite-brand">{t.comercio}</td>
                    <td className="px-6 py-4">
                      {editingCat === t._id ? (
                        <select
                          value={t.categoria}
                          onChange={(e) => updateCategoria(t._id, e.target.value)}
                          onBlur={() => setEditingCat(null)}
                          autoFocus
                          className="input h-8 px-2 text-[13px] w-32"
                        >
                          {CATEGORIAS_BASE.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingCat(t._id)}
                          className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 text-[12px] font-semibold hover:bg-purple-100 transition-colors"
                        >
                          {t.categoria}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-graphite-brand tabular-nums">
                      {t.tipo === "ingreso" ? "+" : "-"}{fmtSoles(t.monto)}
                    </td>
                    <td className="px-6 py-4 text-gray-brand">{t.banco || "—"}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteTransaction(t._id)}
                        className="text-gray-brand/40 hover:text-red-500 transition-colors p-1"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
