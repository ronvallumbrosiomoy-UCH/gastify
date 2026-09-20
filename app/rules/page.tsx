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
    return <div className="text-center py-20 text-text-secondary">Cargando...</div>;
  }
  if (status === "unauthenticated") return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-graphite-brand">🧠 Aprendizaje personalizado</h1>
        <p className="text-text-secondary mt-1">
          Crea reglas para que Gastify clasifique tus gastos como tú quieres. Las reglas tienen prioridad sobre la IA.
        </p>
      </div>

      <div className="bg-card border border-card-border rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-graphite-brand mb-4">Crear nueva regla</h2>
        <form onSubmit={addRule} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-card-border focus:outline-none focus:border-purple-brand focus:ring-2 focus:ring-purple-brand/20 bg-background transition-all"
              placeholder="Ej: Gastos en Rappi"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Condición</label>
            <input
              value={condicion}
              onChange={(e) => setCondicion(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-card-border focus:outline-none focus:border-purple-brand focus:ring-2 focus:ring-purple-brand/20 bg-background transition-all"
              placeholder="Ej: monto < 5, comercio contiene rappi"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-card-border focus:outline-none focus:border-purple-brand focus:ring-2 focus:ring-purple-brand/20 bg-background transition-all"
            >
              {CATEGORIAS_BASE.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-purple-brand text-white font-medium hover:bg-purple-brand/90 disabled:opacity-50 transition-all"
          >
            {saving ? "Guardando..." : "Agregar regla"}
          </button>
        </form>
      </div>

      <div className="bg-card border border-card-border rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-graphite-brand mb-4">
          Tus reglas ({rules.length})
        </h2>
        {loading ? (
          <p className="text-text-secondary text-sm">Cargando reglas...</p>
        ) : rules.length === 0 ? (
          <p className="text-text-secondary text-sm py-6 text-center">
            Aún no tienes reglas. Crea la primera para personalizar tu categorización.
          </p>
        ) : (
          <div className="space-y-3">
            {rules.map((r) => (
              <div key={r._id} className="flex items-center justify-between p-4 rounded-xl bg-surface border border-card-border">
                <div>
                  <p className="font-medium text-graphite-brand">{r.nombre}</p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Si {r.condicion} → {r.categoria}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-brand/10 text-purple-brand text-xs font-medium">
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