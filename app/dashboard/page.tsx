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
        <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
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
          <h1 className="text-[28px] font-bold tracking-tight text-graphite-brand">
            Hola, {session.user?.name}
          </h1>
          <p className="text-[15px] text-gray-brand mt-1">
            {data ? `${fmtMes[data.mes]} ${data.anio} — resumen de gastos` : "Conecta tu Gmail para empezar."}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={connectGmail} className="btn btn-secondary h-10 text-[14px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            Conectar Gmail
          </button>
          <button onClick={syncGmail} disabled={syncing} className="btn btn-primary h-10 text-[14px] disabled:opacity-50">
            {syncing ? <span className="spinner" /> : "↻"} Sincronizar
          </button>
        </div>
      </div>

      {/* Status */}
      {gmailStatus && (
        <div className={`px-4 py-3 rounded-xl text-[14px] font-medium animate-slideUp ${
          gmailStatus.startsWith("Error")
            ? "bg-red-50 text-red-600 border border-red-100"
            : "bg-emerald-50 text-emerald-700 border border-emerald-100"
        }`}>
          {gmailStatus}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : !data ? (
        /* Empty state */
        <div className="card-elevated p-16 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </div>
          <h2 className="text-[22px] font-bold tracking-tight text-graphite-brand mb-2">
            Conecta tu Gmail
          </h2>
          <p className="text-[15px] text-gray-brand max-w-md mx-auto mb-8">
            Gastify detectará automáticamente tus gastos de bancos peruanos.
          </p>
          <button onClick={connectGmail} className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <p className="text-[13px] font-medium text-gray-brand">Gasto del mes</p>
              <p className="text-[24px] font-bold tracking-tight text-graphite-brand mt-1">
                {fmtSoles(data.totalActual)}
              </p>
              <p className={`text-[13px] font-medium mt-2 ${data.pct <= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {data.pct <= 0 ? "↓" : "↑"} {Math.abs(data.pct).toFixed(0)}% vs mes anterior
              </p>
            </div>
            <div className="kpi animate-fadeIn opacity-0">
              <p className="text-[13px] font-medium text-gray-brand">Promedio diario</p>
              <p className="text-[24px] font-bold tracking-tight text-graphite-brand mt-1">
                {fmtSoles(data.diarioPromedio)}
              </p>
              <p className="text-[13px] text-gray-brand mt-2">por día</p>
            </div>
            <div className="kpi animate-fadeIn opacity-0">
              <p className="text-[13px] font-medium text-gray-brand">Categorías</p>
              <p className="text-[24px] font-bold tracking-tight text-purple-brand mt-1">
                {data.categorias.length}
              </p>
              <p className="text-[13px] text-gray-brand mt-2">activas</p>
            </div>
            <div className="kpi animate-fadeIn opacity-0">
              <p className="text-[13px] font-medium text-gray-brand">Gastos fijos</p>
              <p className="text-[24px] font-bold tracking-tight text-amber-brand mt-1">
                {data.fijos.length}
              </p>
              <p className="text-[13px] text-gray-brand mt-2">suscripciones</p>
            </div>
          </div>

          {/* Insights */}
          <div className="card p-6 border-l-[3px] border-l-emerald-500">
            <h2 className="text-[16px] font-semibold text-graphite-brand mb-4">Insights</h2>
            <ul className="space-y-3">
              {data.insights.map((ins, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px] text-gray-700 leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {ins}
                </li>
              ))}
            </ul>
          </div>

          {/* Alerts */}
          {alertas.length > 0 && (
            <div className="card p-6 border-l-[3px] border-l-amber-500">
              <h2 className="text-[16px] font-semibold text-amber-600 mb-4">Alertas</h2>
              <div className="space-y-3">
                {alertas.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                    <div>
                      <p className="text-[14px] font-semibold text-graphite-brand">{a.categoria}</p>
                      <p className="text-[13px] text-gray-brand mt-0.5">
                        S/ {a.actual.toFixed(2)} vs promedio S/ {a.promedio.toFixed(2)}
                      </p>
                    </div>
                    <span className="badge bg-amber-100 text-amber-700">
                      +{a.pct.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-6">
              <h2 className="text-[16px] font-semibold text-graphite-brand mb-5">Por categoría</h2>
              {data.categorias.length === 0 ? (
                <p className="text-gray-brand text-[14px] py-12 text-center">Sin datos</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={data.categorias}
                      dataKey="total"
                      nameKey="categoria"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
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
            <div className="card p-6">
              <h2 className="text-[16px] font-semibold text-graphite-brand mb-5">Top gastos</h2>
              {data.categorias.length === 0 ? (
                <p className="text-gray-brand text-[14px] py-12 text-center">Sin datos</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.categorias.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                    <XAxis dataKey="categoria" tick={{ fontSize: 12, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
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
