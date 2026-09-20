"use client";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

interface InsightData {
  totalActual: number;
  totalAnterior: number;
  pct: number;
  diarioPromedio: number;
  categorias: { categoria: string; total: number }[];
  fijos: { comercio: string; monto: number }[];
  insights: string[];
  mes: number;
  anio: number;
}

const COLORS = ["#10B981", "#7C3AED", "#F59E0B", "#EF4444", "#0EA5E9", "#8B5CF6", "#F97316", "#14B8A6", "#6366F1", "#64748B"];

const fmtSoles = (n: number) =>
  "S/ " + n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<InsightData | null>(null);
  const [alertas, setAlertas] = useState<{ categoria: string; actual: number; promedio: number; pct: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [gmailStatus, setGmailStatus] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const fetchInsights = useCallback(async () => {
    const res = await fetch("/api/insights");
    if (res.ok) {
      const json = await res.json();
      setData(json);
    }
    const resAlerts = await fetch("/api/alerts");
    if (resAlerts.ok) {
      const json = await resAlerts.json();
      setAlertas(json.alertas || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetchInsights();
      const params = new URLSearchParams(window.location.search);
      const gmail = params.get("gmail");
      if (gmail === "connected") setGmailStatus("Conectado exitosamente");
      if (gmail === "error") setGmailStatus("Error al conectar Gmail");
    }
  }, [status, router, fetchInsights]);

  async function connectGmail() {
    const res = await fetch("/api/gmail/oauth");
    const json = await res.json();
    if (json.url) window.location.href = json.url;
  }

  async function syncGmail() {
    setSyncing(true);
    const res = await fetch("/api/gmail/sync", { method: "POST" });
    const json = await res.json();
    if (res.ok) {
      setGmailStatus(`Gmail sincronizado: ${json.creadas} transacciones nuevas`);
      fetchInsights();
    } else {
      setGmailStatus(`Error: ${json.error}`);
    }
    setSyncing(false);
  }

  if (status === "loading") {
    return <div className="text-center py-20 text-text-secondary">Cargando Gastify...</div>;
  }
  if (!session) return null;

  const fmtMes = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-graphite-brand">Hola, {session.user?.name} 👋</h1>
          <p className="text-text-secondary mt-1">
            {data ? `Resumen de ${fmtMes[data.mes]} ${data.anio}` : "Conecta tu Gmail para empezar."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={connectGmail}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-surface transition-all"
          >
            📧 Conectar Gmail
          </button>
          <button
            onClick={syncGmail}
            disabled={syncing}
            className="px-4 py-2 rounded-xl bg-emerald-brand text-white text-sm font-medium hover:bg-emerald-brand/90 disabled:opacity-50 transition-all"
          >
            {syncing ? "Sincronizando..." : "⟳ Sincronizar"}
          </button>
        </div>
      </div>

      {gmailStatus && (
        <div className={`p-3 rounded-xl text-sm ${gmailStatus.startsWith("Error") ? "bg-red-50 text-red-brand" : "bg-mint-brand text-graphite-brand"}`}>
          {gmailStatus}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-text-secondary">Cargando datos...</div>
      ) : !data ? (
        <div className="bg-card border border-card-border rounded-2xl p-10 text-center">
          <div className="text-4xl mb-4">💡</div>
          <h2 className="text-xl font-semibold text-graphite-brand mb-2">Conecta tu Gmail</h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Gastify detectará automáticamente tus gastos de bancos como BCP, BBVA, Interbank y Scotiabank.
          </p>
          <button
            onClick={connectGmail}
            className="px-6 py-3 rounded-xl bg-emerald-brand text-white font-medium hover:bg-emerald-brand/90 transition-all"
          >
            📧 Conectar Gmail
          </button>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-card-border rounded-xl p-5">
              <p className="text-text-secondary text-xs">Gasto del mes</p>
              <p className="text-2xl font-bold text-graphite-brand mt-1">{fmtSoles(data.totalActual)}</p>
              <p className={`text-xs mt-1 ${data.pct <= 0 ? "text-emerald-brand" : "text-red-brand"}`}>
                {data.pct <= 0 ? "↓" : "↑"} {Math.abs(data.pct).toFixed(0)}% vs mes anterior
              </p>
            </div>
            <div className="bg-card border border-card-border rounded-xl p-5">
              <p className="text-text-secondary text-xs">Gasto diario promedio</p>
              <p className="text-2xl font-bold text-graphite-brand mt-1">{fmtSoles(data.diarioPromedio)}</p>
              <p className="text-xs text-text-secondary mt-1">promedio diario</p>
            </div>
            <div className="bg-card border border-card-border rounded-xl p-5">
              <p className="text-text-secondary text-xs">Categorías</p>
              <p className="text-2xl font-bold text-purple-brand mt-1">{data.categorias.length}</p>
              <p className="text-xs text-text-secondary mt-1">con gastos este mes</p>
            </div>
            <div className="bg-card border border-card-border rounded-xl p-5">
              <p className="text-text-secondary text-xs">Gastos fijos</p>
              <p className="text-2xl font-bold text-amber-brand mt-1">{data.fijos.length}</p>
              <p className="text-xs text-text-secondary mt-1">suscripciones</p>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-gradient-to-r from-mint-brand/60 to-purple-brand/10 border border-card-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-graphite-brand mb-3">💡 Insights de la IA</h2>
            <ul className="space-y-2">
              {data.insights.map((ins, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-graphite-brand">
                  <span className="text-purple-brand mt-0.5">✦</span> {ins}
                </li>
              ))}
            </ul>
          </div>

          {/* Alertas */}
          {alertas.length > 0 && (
            <div className="bg-amber-brand/5 border border-amber-brand/30 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-amber-brand mb-3">⚠️ Alertas</h2>
              <div className="space-y-2">
                {alertas.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-background/60 border border-amber-brand/20">
                    <div>
                      <p className="font-medium text-graphite-brand text-sm">{a.categoria}</p>
                      <p className="text-xs text-text-secondary">
                        Llevas S/ {a.actual.toFixed(2)} vs. tu promedio de S/ {a.promedio.toFixed(2)}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-brand/20 text-amber-brand text-xs font-bold">
                      +{a.pct.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-graphite-brand mb-4">Gastos por categoría</h2>
              {data.categorias.length === 0 ? (
                <p className="text-text-secondary text-sm py-10 text-center">Sin datos este mes</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={data.categorias}
                      dataKey="total"
                      nameKey="categoria"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {data.categorias.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => fmtSoles(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-card border border-card-border rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-graphite-brand mb-4">Top gastos</h2>
              {data.categorias.length === 0 ? (
                <p className="text-text-secondary text-sm py-10 text-center">Sin datos este mes</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.categorias.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="categoria" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(v: any) => fmtSoles(Number(v))} />
                    <Bar dataKey="total" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}