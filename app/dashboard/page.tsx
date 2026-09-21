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
      const gmailMsg = params.get("msg");
      if (gmail === "connected") setGmailStatus("Conectado exitosamente");
      if (gmail === "error") setGmailStatus(`Error: ${gmailMsg || "desconocido"}`);
    }
  }, [status, router, fetchInsights]);

  async function connectGmail() {
    const res = await fetch("/api/gmail/oauth");
    const json = await res.json();
    if (json.url) window.location.href = json.url;
  }

  async function syncGmail() {
    setSyncing(true);
    setGmailStatus(null);
    try {
      const res = await fetch("/api/gmail/sync", { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        const parts = [];
        if (json.creadas > 0) parts.push(`${json.creadas} nuevas`);
        if (json.duplicadas > 0) parts.push(`${json.duplicadas} duplicadas omitidas`);
        if (json.procesados === 0) parts.push("No se encontraron emails bancarios en los últimos 30 días");
        setGmailStatus(parts.length > 0
          ? `Sincronización completa: ${parts.join(" | ")}`
          : "Sincronización completa: sin cambios"
        );
        fetchInsights();
      } else {
        setGmailStatus(`Error: ${json.error}`);
      }
    } catch {
      setGmailStatus("Error de conexión al sincronizar");
    }
    setSyncing(false);
  }

  if (status === "loading") {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "160px 0" }}>
        <div className="spinner spinner-dark" style={{ width: "32px", height: "32px" }} />
      </div>
    );
  }
  if (!session) return null;

  const fmtMes = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <div className="animate-fadeIn" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div className="page-header" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px" }}>
        <div>
          <h1 className="page-title">Hola, {session.user?.name} 👋</h1>
          <p className="page-subtitle">
            {data ? `${fmtMes[data.mes]} ${data.anio} — resumen de gastos` : "Conecta tu Gmail para empezar."}
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={connectGmail} className="btn btn-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            Conectar Gmail
          </button>
          <button onClick={syncGmail} disabled={syncing} className="btn btn-primary" style={{ opacity: syncing ? 0.5 : 1 }}>
            {syncing ? <span className="spinner" /> : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <div className={`alert-card animate-slideUp ${gmailStatus.startsWith("Error") ? "alert-red" : "alert-green"}`}>
          {gmailStatus.startsWith("Error") ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          )}
          <span style={{ fontSize: "14px", fontWeight: 500 }}>{gmailStatus}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "128px 0" }}>
          <div className="spinner spinner-dark" style={{ width: "32px", height: "32px" }} />
        </div>
      ) : !data ? (
        /* Empty state */
        <div className="card-elevated empty-state animate-scaleIn">
          <div className="empty-state-icon empty-state-icon-green">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative", zIndex: 10 }}>
              <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </div>
          <h2>Conecta tu Gmail</h2>
          <p>Gastify detectará automáticamente tus gastos de BCP, BBVA, Interbank, Scotiabank, MiBank, Yape y Plin.</p>
          <button onClick={connectGmail} className="btn btn-primary" style={{ marginTop: "32px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            Conectar Gmail
          </button>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div className="kpi animate-fadeIn" style={{ opacity: 0 }}>
              <div className="kpi-icon kpi-icon-green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <p className="kpi-label">Gasto del mes</p>
              <p className="kpi-value">{fmtSoles(data.totalActual)}</p>
              <p className={`kpi-change ${data.pct <= 0 ? "positive" : "negative"}`}>
                {data.pct <= 0 ? "↓" : "↑"} {Math.abs(data.pct).toFixed(0)}% vs mes anterior
              </p>
            </div>
            <div className="kpi animate-fadeIn" style={{ opacity: 0 }}>
              <div className="kpi-icon kpi-icon-blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <p className="kpi-label">Promedio diario</p>
              <p className="kpi-value">{fmtSoles(data.diarioPromedio)}</p>
              <p className="kpi-change neutral">por día</p>
            </div>
            <div className="kpi animate-fadeIn" style={{ opacity: 0 }}>
              <div className="kpi-icon kpi-icon-purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2H2v10h10V2z"/><path d="M22 12H12v10h10V12z"/><path d="M22 2H12v5h10V2z"/><path d="M7 12H2v10h5V12z"/>
                </svg>
              </div>
              <p className="kpi-label">Categorías</p>
              <p className="kpi-value" style={{ color: "var(--purple-500)" }}>{data.categorias.length}</p>
              <p className="kpi-change neutral">activas</p>
            </div>
            <div className="kpi animate-fadeIn" style={{ opacity: 0 }}>
              <div className="kpi-icon kpi-icon-amber">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <p className="kpi-label">Gastos fijos</p>
              <p className="kpi-value" style={{ color: "var(--amber-500)" }}>{data.fijos.length}</p>
              <p className="kpi-change neutral">suscripciones</p>
            </div>
          </div>

          {/* Insights */}
          <div className="card insight-card insight-card-green" style={{ padding: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--gray-900)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="kpi-icon kpi-icon-green" style={{ width: "32px", height: "32px" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              </div>
              Insights de la IA
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {data.insights.map((ins, i) => (
                <div key={i} className="insight-item">
                  <div className="insight-dot" />
                  <span>{ins}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          {alertas.length > 0 && (
            <div className="card insight-card insight-card-amber" style={{ padding: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--amber-600)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="kpi-icon kpi-icon-amber" style={{ width: "32px", height: "32px" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                Alertas
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {alertas.map((a, i) => (
                  <div key={i} className="alert-card alert-amber">
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--gray-900)" }}>{a.categoria}</p>
                      <p style={{ fontSize: "13px", color: "var(--gray-500)", marginTop: "2px" }}>
                        S/ {a.actual.toFixed(2)} vs promedio S/ {a.promedio.toFixed(2)}
                      </p>
                    </div>
                    <span className="badge badge-amber">+{a.pct.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            <div className="chart-card">
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--gray-900)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="kpi-icon kpi-icon-purple" style={{ width: "32px", height: "32px" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
                  </svg>
                </div>
                Por categoría
              </h2>
              {data.categorias.length === 0 ? (
                <p style={{ color: "var(--gray-500)", textAlign: "center", padding: "48px 0" }}>Sin datos</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={data.categorias} dataKey="total" nameKey="categoria" cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} strokeWidth={0}>
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
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--gray-900)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="kpi-icon kpi-icon-blue" style={{ width: "32px", height: "32px" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
                    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                </div>
                Top gastos
              </h2>
              {data.categorias.length === 0 ? (
                <p style={{ color: "var(--gray-500)", textAlign: "center", padding: "48px 0" }}>Sin datos</p>
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
