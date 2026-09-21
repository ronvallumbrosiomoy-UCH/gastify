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
      <div className="flex items-center justify-center py-40">
        <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }
  if (status === "unauthenticated") return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-graphite-brand">
          Reglas personalizadas
        </h1>
        <p className="text-[15px] text-gray-brand mt-1">
          Crea reglas para clasificar gastos como tú quieres. Prioridad sobre la IA.
        </p>
      </div>

      {/* Form */}
      <div className="card p-6">
        <h2 className="text-[15px] font-semibold text-graphite-brand mb-4">Nueva regla</h2>
        <form onSubmit={addRule} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-brand mb-1.5">Nombre</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="input"
                placeholder="Ej: Gastos en Rappi"
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-brand mb-1.5">Categoría</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="input"
              >
                {CATEGORIAS_BASE.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-brand mb-1.5">Condición</label>
            <input
              value={condicion}
              onChange={(e) => setCondicion(e.target.value)}
              className="input"
              placeholder="Ej: monto < 5, comercio contiene rappi"
              required
            />
          </div>
          <button type="submit" disabled={saving} className="btn btn-primary disabled:opacity-50">
            {saving ? <span className="spinner" /> : "Agregar regla"}
          </button>
        </form>
      </div>

      {/* Rules list */}
      <div className="card p-6">
        <h2 className="text-[15px] font-semibold text-graphite-brand mb-4">
          Tus reglas ({rules.length})
        </h2>
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : rules.length === 0 ? (
          <p className="text-gray-brand text-[14px] py-12 text-center">
            Aún no tienes reglas.
          </p>
        ) : (
          <div className="space-y-2">
            {rules.map((r) => (
              <div
                key={r._id}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-black/[0.02] transition-colors"
              >
                <div>
                  <p className="text-[14px] font-medium text-graphite-brand">{r.nombre}</p>
                  <p className="text-[13px] text-gray-brand mt-0.5">
                    Si <span className="font-medium text-graphite-brand">{r.condicion}</span> → <span className="font-medium text-purple-brand">{r.categoria}</span>
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
