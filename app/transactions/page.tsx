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
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-brand/20 border-t-emerald-brand rounded-full animate-spin" />
          <p className="text-text-secondary">Cargando...</p>
        </div>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-graphite-brand tracking-tight">
            Transacciones
          </h1>
          <p className="text-text-secondary mt-2 text-lg">
            Tus gastos detectados automáticamente.
          </p>
        </div>
        <div className="glass rounded-2xl px-6 py-4 text-center">
          <p className="text-sm text-text-secondary font-medium">Total gastos</p>
          <p className="text-2xl font-bold text-graphite-brand mt-1 tracking-tight">
            {fmtSoles(total)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoriaFilter("")}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            !categoriaFilter
              ? "bg-emerald-brand text-white shadow-md"
              : "glass text-text-secondary hover:text-graphite-brand"
          }`}
        >
          Todas
        </button>
        {CATEGORIAS_BASE.map((c) => (
          <button
            key={c}
            onClick={() => setCategoriaFilter(categoriaFilter === c ? "" : c)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
              categoriaFilter === c
                ? "bg-emerald-brand text-white shadow-md"
                : "glass text-text-secondary hover:text-graphite-brand"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-brand/20 border-t-emerald-brand rounded-full animate-spin" />
            <p className="text-text-secondary">Cargando transacciones...</p>
          </div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-brand/20 to-mint-brand/30 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📭</span>
          </div>
          <h2 className="text-2xl font-bold text-graphite-brand mb-3 tracking-tight">
            Sin transacciones
          </h2>
          <p className="text-text-secondary max-w-md mx-auto text-lg">
            Conecta tu Gmail o usa &quot;Sincronizar&quot; para detectar tus gastos automáticamente.
          </p>
        </div>
      ) : (
        <div className="glass rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border text-left text-xs text-text-secondary uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Fecha</th>
                  <th className="px-6 py-4 font-semibold">Comercio</th>
                  <th className="px-6 py-4 font-semibold">Categoría</th>
                  <th className="px-6 py-4 font-semibold text-right">Monto</th>
                  <th className="px-6 py-4 font-semibold">Banco</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr
                    key={t._id}
                    className="border-b border-card-border last:border-0 hover:bg-white/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-text-secondary">{fmtFecha(t.fecha)}</td>
                    <td className="px-6 py-4 font-medium text-graphite-brand">{t.comercio}</td>
                    <td className="px-6 py-4">
                      {editingCat === t._id ? (
                        <select
                          value={t.categoria}
                          onChange={(e) => updateCategoria(t._id, e.target.value)}
                          onBlur={() => setEditingCat(null)}
                          autoFocus
                          className="apple-input py-1 px-2 text-xs"
                        >
                          {CATEGORIAS_BASE.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingCat(t._id)}
                          className="px-3 py-1.5 rounded-full bg-purple-brand/10 text-purple-brand text-xs font-medium hover:bg-purple-brand/20 transition-all"
                          title="Cambiar categoría"
                        >
                          {t.categoria} ✏️
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-graphite-brand">
                      {t.tipo === "ingreso" ? "+" : "-"}{fmtSoles(t.monto)}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{t.banco || "—"}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteTransaction(t._id)}
                        className="text-red-brand/60 hover:text-red-brand text-sm transition-all"
                      >
                        🗑️
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
