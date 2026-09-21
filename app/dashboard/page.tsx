"use client";
import { useSession } from "next-auth/react";
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
      <div className="flex items-center justify-center py-40">
        <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }
  if (!session) return null;

  const fmtMes = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-tight text-graphite-brand">
            Hola, {session.user?.name} 👋
          </h1>
          <p className="text-[16px] text-gray-brand mt-1">
            {data ? `${fmtMes[data.mes]} ${data.anio} — resumen de gastos` : "Conecta tu Gmail para empezar."}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={connectGmail} className="btn btn-secondary">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            Conectar Gmail
          </button>
          <button onClick={syncGmail} disabled={syncing} className="btn btn-primary disabled:opacity-50">
            {syncing ? <span className="spinner" /> : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                <polyline points="21 3 21 9 15 9"/>
              </svg>
            )}
            Sincronizar
          </button>
        </div>
      </div>

      {/* Status */}
      {gmailStatus && (
        <div className={`card px-5 py-4 flex items-center gap-3 animate-slideUp ${
          gmailStatus.startsWith("Error")
            ? "bg-red-50/80 border-red-100 text-red-600"
            : "bg-emerald-50/80 border-emerald-100 text-emerald-700"
        }`}>
          {gmailStatus.startsWith("Error") ? (
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          )}
          <span className="text-[14px] font-medium">{gmailStatus}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : !data ? (
        /* Empty state */
        <div className="card-elevated p-16 text-center animate-scaleIn">
          <div className="illustration inline-flex mb-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30 relative z-10">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
          </div>
          <h2 className="text-[24px] font-extrabold tracking-tight text-graphite-brand mb-3">
            Conecta tu Gmail
          </h2>
          <p className="text-[16px] text-gray-brand max-w-md mx-auto mb-8 leading-relaxed">
            Gastify detectará automáticamente tus gastos de bancos peruanos como BCP, BBVA, Interbank y Scotiabank.
          </p>
          <button onClick={connectGmail} className="btn btn-primary">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            Conectar Gmail
          </button>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            <div className="kpi animate-fadeIn opacity-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <p className="text-[13px] font-semibold text-gray-brand">Gasto del mes</p>
              </div>
              <p className="text-[28px] font-extrabold tracking-tight text-graphite-brand">
                {fmtSoles(data.totalActual)}
              </p>
              <p className={`text-[13px] font-semibold mt-2 ${data.pct <= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {data.pct <= 0 ? "↓" : "↑"} {Math.abs(data.pct).toFixed(0)}% vs mes anterior
              </p>
            </div>
            <div className="kpi animate-fadeIn opacity-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <p className="text-[13px] font-semibold text-gray-brand">Promedio diario</p>
              </div>
              <p className="text-[28px] font-extrabold tracking-tight text-graphite-brand">
                {fmtSoles(data.diarioPromedio)}
              </p>
              <p className="text-[13px] text-gray-brand mt-2">por día</p>
            </div>
            <div className="kpi animate-fadeIn opacity-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2H2v10h10V2z"/><path d="M22 12H12v10h10V12z"/><path d="M22 2H12v5h10V2z"/><path d="M7 12H2v10h5V12z"/>
                  </svg>
                </div>
                <p className="text-[13px] font-semibold text-gray-brand">Categorías</p>
              </div>
              <p className="text-[28px] font-extrabold tracking-tight text-purple-600">
                {data.categorias.length}
              </p>
              <p className="text-[13px] text-gray-brand mt-2">activas</p>
            </div>
            <div className="kpi animate-fadeIn opacity-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <p className="text-[13px] font-semibold text-gray-brand">Gastos fijos</p>
              </div>
              <p className="text-[28px] font-extrabold tracking-tight text-amber-600">
                {data.fijos.length}
              </p>
              <p className="text-[13px] text-gray-brand mt-2">suscripciones</p>
            </div>
          </div>

          {/* Insights */}
          <div className="card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600" />
            <h2 className="text-[18px] font-bold text-graphite-brand mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              </div>
              Insights de la IA
            </h2>
            <ul className="space-y-3">
              {data.insights.map((ins, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px] text-gray-700 leading-relaxed p-3 rounded-xl hover:bg-emerald-50/50 transition-colors">
                  <span className="mt-1 w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 shrink-0" />
                  {ins}
                </li>
              ))}
            </ul>
          </div>

          {/* Alerts */}
          {alertas.length > 0 && (
            <div className="card p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
              <h2 className="text-[18px] font-bold text-amber-600 mb-5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                Alertas
              </h2>
              <div className="space-y-3">
                {alertas.map((a, i) => (
                  <div key={i} className="alert-card bg-amber-50/50 border border-amber-100 rounded-xl">
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold text-graphite-brand">{a.categoria}</p>
                      <p className="text-[13px] text-gray-brand mt-0.5">
                        S/ {a.actual.toFixed(2)} vs promedio S/ {a.promedio.toFixed(2)}
                      </p>
                    </div>
                    <span className="badge bg-gradient-to-r from-amber-400 to-amber-500">
                      +{a.pct.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="chart-card">
              <h2 className="text-[18px] font-bold text-graphite-brand mb-5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
                  </svg>
                </div>
                Por categoría
              </h2>
              {data.categorias.length === 0 ? (
                <p className="text-gray-brand text-[14px] py-12 text-center">Sin datos</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={data.categorias}
                      dataKey="total"
                      nameKey="categoria"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={4}
                      strokeWidth={0}
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
            <div className="chart-card">
              <h2 className="text-[18px] font-bold text-graphite-brand mb-5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                </div>
                Top gastos
              </h2>
              {data.categorias.length === 0 ? (
                <p className="text-gray-brand text-[14px] py-12 text-center">Sin datos</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.categorias.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="categoria" tick={{ fontSize: 12, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(v: any) => fmtSoles(Number(v))} />
                    <Bar dataKey="total" fill="url(#gradientBar)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
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
