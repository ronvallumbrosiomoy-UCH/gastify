"use client";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Mensaje {
  rol: "usuario" | "ia";
  texto: string;
}

export default function ChatPage() {
  const { status } = useSession();
  const router = useRouter();
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { rol: "ia", texto: "¡Hola! Soy tu asesor financiero. Pregúntame sobre tus gastos." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, loading]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const pregunta = input.trim();
    setInput("");
    setMensajes((m) => [...m, { rol: "usuario", texto: pregunta }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: pregunta }),
      });
      const json = await res.json();
      setMensajes((m) => [...m, { rol: "ia", texto: json.respuesta || json.error || "Error" }]);
    } catch {
      setMensajes((m) => [...m, { rol: "ia", texto: "Error de conexión" }]);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "160px 0" }}>
        <div className="spinner spinner-dark" style={{ width: "32px", height: "32px" }} />
      </div>
    );
  }
  if (status === "unauthenticated") return null;

  const sugerencias = [
    "¿En qué gasté más este mes?",
    "¿Cuánto gasté en total?",
    "¿Qué gastos fijos tengo?",
    "¿Cómo comparo con el mes pasado?",
  ];

  return (
    <div className="animate-fadeIn" style={{ maxWidth: "768px", margin: "0 auto" }}>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          <div className="page-icon page-icon-purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          Asesor financiero
        </h1>
        <p className="page-subtitle" style={{ marginLeft: "56px" }}>Pregúntale a Gastify sobre tus gastos.</p>
      </div>

      {/* Chat Container */}
      <div className="card-elevated" style={{ display: "flex", flexDirection: "column", height: "65vh", overflow: "hidden" }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {mensajes.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.rol === "usuario" ? "flex-end" : "flex-start" }}>
              <div className={`chat-bubble ${m.rol === "usuario" ? "chat-bubble-user" : "chat-bubble-ai"}`}>
                {m.texto}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div className="chat-typing">
                <div className="chat-typing-dot" />
                <div className="chat-typing-dot" />
                <div className="chat-typing-dot" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        <div style={{ padding: "0 24px 16px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {sugerencias.map((s) => (
              <button key={s} onClick={() => setInput(s)} className="suggestion-chip">
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.4)", padding: "16px", background: "rgba(255,255,255,0.3)" }}>
          <form onSubmit={enviar} style={{ display: "flex", gap: "12px" }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Pregúntale a tu asesor..." className="input" style={{ flex: 1, height: "48px" }} />
            <button type="submit" disabled={loading || !input.trim()} className="btn btn-primary" style={{ height: "48px", padding: "0 24px", opacity: loading || !input.trim() ? 0.4 : 1 }}>
              {loading ? <span className="spinner" /> : "Enviar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
