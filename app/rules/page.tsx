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
        <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }
  if (status === "unauthenticated") return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-[32px] font-extrabold tracking-tight text-graphite-brand flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </div>
          Reglas personalizadas
        </h1>
        <p className="text-[16px] text-gray-brand mt-2 ml-[52px]">
          Clasifica gastos como tú quieres. Prioridad sobre la IA.
        </p>
      </div>

      {/* Form */}
      <div className="card p-6">
        <h2 className="text-[16px] font-bold text-graphite-brand mb-5 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
          Nueva regla
        </h2>
        <form onSubmit={addRule} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-gray-brand mb-2 ml-1">Nombre</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="input"
                placeholder="Ej: Gastos en Rappi"
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-brand mb-2 ml-1">Categoría</label>
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
            <label className="block text-[13px] font-semibold text-gray-brand mb-2 ml-1">Condición</label>
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
        <h2 className="text-[16px] font-bold text-graphite-brand mb-5 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          Tus reglas ({rules.length})
        </h2>
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : rules.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <p className="text-gray-brand text-[14px]">
              Aún no tienes reglas.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((r) => (
              <div
                key={r._id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-white/40 hover:bg-white/80 hover:border-white/60 transition-all"
              >
                <div>
                  <p className="text-[14px] font-semibold text-graphite-brand">{r.nombre}</p>
                  <p className="text-[13px] text-gray-brand mt-0.5">
                    Si <span className="font-medium text-graphite-brand">{r.condicion}</span> → <span className="font-medium text-purple-600">{r.categoria}</span>
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
