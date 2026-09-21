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
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-brand/20 border-t-emerald-brand rounded-full animate-spin" />
          <p className="text-text-secondary">Cargando Gastify...</p>
        </div>
      </div>
    );
  }
  if (!session) return null;

  const fmtMes = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-graphite-brand tracking-tight">
            Hola, {session.user?.name} 👋
          </h1>
          <p className="text-text-secondary mt-2 text-lg">
            {data ? `Resumen de ${fmtMes[data.mes]} ${data.anio}` : "Conecta tu Gmail para empezar."}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={connectGmail}
            className="apple-button apple-button-secondary"
          >
            <span className="mr-2">📧</span> Conectar Gmail
          </button>
          <button
            onClick={syncGmail}
            disabled={syncing}
            className="apple-button apple-button-primary disabled:opacity-50"
          >
            {syncing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sincronizando...
              </span>
            ) : (
              <>
                <span className="mr-2">⟳</span> Sincronizar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Gmail Status */}
      {gmailStatus && (
        <div className={`p-4 rounded-2xl text-sm font-medium animate-slideUp ${
          gmailStatus.startsWith("Error") 
            ? "bg-red-50 text-red-600 border border-red-100" 
            : "bg-emerald-50 text-emerald-700 border border-emerald-100"
        }`}>
          {gmailStatus}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-brand/20 border-t-emerald-brand rounded-full animate-spin" />
            <p className="text-text-secondary">Cargando datos...</p>
          </div>
        </div>
      ) : !data ? (
        /* Empty State */
        <div className="glass rounded-3xl p-12 text-center animate-fadeIn">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-brand/20 to-mint-brand/30 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">💡</span>
          </div>
          <h2 className="text-2xl font-bold text-graphite-brand mb-3 tracking-tight">
            Conecta tu Gmail
          </h2>
          <p className="text-text-secondary mb-8 max-w-md mx-auto text-lg leading-relaxed">
            Gastify detectará automáticamente tus gastos de bancos como BCP, BBVA, Interbank y Scotiabank.
          </p>
          <button
            onClick={connectGmail}
            className="apple-button apple-button-primary"
          >
            <span className="mr-2">📧</span> Conectar Gmail
          </button>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="apple-card p-6">
              <p className="text-text-secondary text-sm font-medium">Gasto del mes</p>
              <p className="text-3xl font-bold text-graphite-brand mt-2 tracking-tight">
                {fmtSoles(data.totalActual)}
              </p>
              <p className={`text-sm mt-2 font-medium ${data.pct <= 0 ? "text-emerald-brand" : "text-red-brand"}`}>
                {data.pct <= 0 ? "↓" : "↑"} {Math.abs(data.pct).toFixed(0)}% vs mes anterior
              </p>
            </div>
            <div className="apple-card p-6">
              <p className="text-text-secondary text-sm font-medium">Gasto diario promedio</p>
              <p className="text-3xl font-bold text-graphite-brand mt-2 tracking-tight">
                {fmtSoles(data.diarioPromedio)}
              </p>
              <p className="text-sm text-text-secondary mt-2">promedio diario</p>
            </div>
            <div className="apple-card p-6">
              <p className="text-text-secondary text-sm font-medium">Categorías</p>
              <p className="text-3xl font-bold text-purple-brand mt-2 tracking-tight">
                {data.categorias.length}
              </p>
              <p className="text-sm text-text-secondary mt-2">con gastos este mes</p>
            </div>
            <div className="apple-card p-6">
              <p className="text-text-secondary text-sm font-medium">Gastos fijos</p>
              <p className="text-3xl font-bold text-amber-brand mt-2 tracking-tight">
                {data.fijos.length}
              </p>
              <p className="text-sm text-text-secondary mt-2">suscripciones</p>
            </div>
          </div>

          {/* Insights */}
          <div className="glass rounded-3xl p-8 border-l-4 border-l-emerald-brand">
            <h2 className="text-xl font-bold text-graphite-brand mb-4 tracking-tight">
              💡 Insights de la IA
            </h2>
            <ul className="space-y-3">
              {data.insights.map((ins, i) => (
                <li key={i} className="flex items-start gap-3 text-base text-graphite-brand">
                  <span className="text-emerald-brand mt-1 text-lg">✦</span>
                  <span className="leading-relaxed">{ins}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Alertas */}
          {alertas.length > 0 && (
            <div className="glass rounded-3xl p-8 border-l-4 border-l-amber-brand">
              <h2 className="text-xl font-bold text-amber-brand mb-4 tracking-tight">
                ⚠️ Alertas
              </h2>
              <div className="space-y-3">
                {alertas.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/50 border border-amber-brand/20">
                    <div>
                      <p className="font-semibold text-graphite-brand">{a.categoria}</p>
                      <p className="text-sm text-text-secondary mt-1">
                        Llevas S/ {a.actual.toFixed(2)} vs. tu promedio de S/ {a.promedio.toFixed(2)}
                      </p>
                    </div>
                    <span className="px-3 py-1.5 rounded-full bg-amber-brand/20 text-amber-brand text-sm font-bold">
                      +{a.pct.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="apple-card p-8">
              <h2 className="text-xl font-bold text-graphite-brand mb-6 tracking-tight">
                Gastos por categoría
              </h2>
              {data.categorias.length === 0 ? (
                <p className="text-text-secondary text-center py-12">Sin datos este mes</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={data.categorias}
                      dataKey="total"
                      nameKey="categoria"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {data.categorias.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(v: any) => fmtSoles(Number(v))}
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="apple-card p-8">
              <h2 className="text-xl font-bold text-graphite-brand mb-6 tracking-tight">
                Top gastos
              </h2>
              {data.categorias.length === 0 ? (
                <p className="text-text-secondary text-center py-12">Sin datos este mes</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.categorias.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                    <XAxis 
                      dataKey="categoria" 
                      tick={{ fontSize: 12, fill: '#86868B' }} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#86868B' }} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip 
                      formatter={(v: any) => fmtSoles(Number(v))}
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      }}
                    />
                    <Bar dataKey="total" fill="#10B981" radius={[8, 8, 0, 0]} />
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
