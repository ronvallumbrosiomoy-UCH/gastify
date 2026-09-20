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
    return <div className="text-center py-20 text-text-secondary">Cargando...</div>;
  }
  if (status === "unauthenticated") return null;

  const total = transactions
    .filter((t) => t.tipo === "gasto")
    .reduce((s, t) => s + t.monto, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-graphite-brand">Transacciones</h1>
          <p className="text-text-secondary mt-1">Tus gastos detectados automáticamente.</p>
        </div>
        <div className="bg-card border border-card-border rounded-xl px-5 py-3 text-center">
          <p className="text-xs text-text-secondary">Total gastos</p>
          <p className="text-xl font-bold text-graphite-brand">{fmtSoles(total)}</p>
        </div>
      </div>

      {/* Filtro por categoría */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoriaFilter("")}
          className={`px-3 py-1.5 text-xs rounded-full transition-all ${
            !categoriaFilter
              ? "bg-emerald-brand text-white"
              : "border border-gray-200 text-text-secondary hover:border-emerald-brand"
          }`}
        >
          Todas
        </button>
        {CATEGORIAS_BASE.map((c) => (
          <button
            key={c}
            onClick={() => setCategoriaFilter(categoriaFilter === c ? "" : c)}
            className={`px-3 py-1.5 text-xs rounded-full transition-all ${
              categoriaFilter === c
                ? "bg-emerald-brand text-white"
                : "border border-gray-200 text-text-secondary hover:border-emerald-brand"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-text-secondary">Cargando transacciones...</div>
      ) : transactions.length === 0 ? (
        <div className="bg-card border border-card-border rounded-2xl p-10 text-center">
          <div className="text-4xl mb-4">📭</div>
          <h2 className="text-lg font-semibold text-graphite-brand mb-2">Sin transacciones</h2>
          <p className="text-text-secondary">
            Conecta tu Gmail o usa "Sincronizar" para detectar tus gastos automáticamente.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border text-left text-xs text-text-secondary">
                  <th className="px-5 py-3 font-medium">Fecha</th>
                  <th className="px-5 py-3 font-medium">Comercio</th>
                  <th className="px-5 py-3 font-medium">Categoría</th>
                  <th className="px-5 py-3 font-medium text-right">Monto</th>
                  <th className="px-5 py-3 font-medium">Banco</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id} className="border-b border-card-border last:border-0 hover:bg-surface/50 transition-colors">
                    <td className="px-5 py-3 text-text-secondary">{fmtFecha(t.fecha)}</td>
                    <td className="px-5 py-3 font-medium text-graphite-brand">{t.comercio}</td>
                    <td className="px-5 py-3">
                      {editingCat === t._id ? (
                        <select
                          value={t.categoria}
                          onChange={(e) => updateCategoria(t._id, e.target.value)}
                          onBlur={() => setEditingCat(null)}
                          autoFocus
                          className="px-2 py-1 rounded-lg border border-purple-brand text-sm bg-background"
                        >
                          {CATEGORIAS_BASE.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingCat(t._id)}
                          className="px-2.5 py-1 rounded-full bg-purple-brand/10 text-purple-brand text-xs font-medium hover:bg-purple-brand/20 transition-all"
                          title="Cambiar categoría"
                        >
                          {t.categoria} ✏️
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-graphite-brand">
                      {t.tipo === "ingreso" ? "+" : "-"}{fmtSoles(t.monto)}
                    </td>
                    <td className="px-5 py-3 text-text-secondary">{t.banco || "—"}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => deleteTransaction(t._id)}
                        className="text-red-brand/60 hover:text-red-brand text-xs font-medium transition-all"
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