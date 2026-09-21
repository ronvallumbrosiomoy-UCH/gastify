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
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-brand/20 border-t-emerald-brand rounded-full animate-spin" />
          <p className="text-text-secondary">Cargando...</p>
        </div>
      </div>
    );
  }
  if (status === "unauthenticated") return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-graphite-brand tracking-tight">
          🧠 Aprendizaje personalizado
        </h1>
        <p className="text-text-secondary mt-2 text-lg">
          Crea reglas para que Gastify clasifique tus gastos como tú quieres. Las reglas tienen prioridad sobre la IA.
        </p>
      </div>

      {/* Create Rule Form */}
      <div className="glass rounded-3xl p-8">
        <h2 className="text-xl font-bold text-graphite-brand mb-6 tracking-tight">
          Crear nueva regla
        </h2>
        <form onSubmit={addRule} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">
              Nombre
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="apple-input"
              placeholder="Ej: Gastos en Rappi"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">
              Condición
            </label>
            <input
              value={condicion}
              onChange={(e) => setCondicion(e.target.value)}
              className="apple-input"
              placeholder="Ej: monto < 5, comercio contiene rappi"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">
              Categoría
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="apple-input"
            >
              {CATEGORIAS_BASE.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="apple-button bg-purple-brand text-white hover:bg-purple-brand/90 disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </span>
            ) : (
              "Agregar regla"
            )}
          </button>
        </form>
      </div>

      {/* Rules List */}
      <div className="glass rounded-3xl p-8">
        <h2 className="text-xl font-bold text-graphite-brand mb-6 tracking-tight">
          Tus reglas ({rules.length})
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-brand/20 border-t-purple-brand rounded-full animate-spin" />
          </div>
        ) : rules.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-purple-brand/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <p className="text-text-secondary">
              Aún no tienes reglas. Crea la primera para personalizar tu categorización.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((r) => (
              <div
                key={r._id}
                className="flex items-center justify-between p-5 rounded-2xl bg-white/50 border border-card-border hover:bg-white/80 transition-all"
              >
                <div>
                  <p className="font-semibold text-graphite-brand">{r.nombre}</p>
                  <p className="text-sm text-text-secondary mt-1">
                    Si <span className="font-medium text-graphite-brand">{r.condicion}</span> →{" "}
                    <span className="font-medium text-purple-brand">{r.categoria}</span>
                  </p>
                </div>
                <span className="px-4 py-2 rounded-full bg-purple-brand/10 text-purple-brand text-sm font-medium">
                  {r.categoria}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
