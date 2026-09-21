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
    {
      rol: "ia",
      texto: "¡Hola! Soy tu asesor financiero. Pregúntame sobre tus gastos.",
    },
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
      setMensajes((m) => [
        ...m,
        { rol: "ia", texto: json.respuesta || json.error || "Error" },
      ]);
    } catch {
      setMensajes((m) => [...m, { rol: "ia", texto: "Error de conexión" }]);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
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
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-[32px] font-extrabold tracking-tight text-graphite-brand flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          Asesor financiero
        </h1>
        <p className="text-[16px] text-gray-brand mt-2 ml-[52px]">
          Pregúntale a Gastify sobre tus gastos.
        </p>
      </div>

      <div className="card-elevated flex flex-col h-[65vh] overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {mensajes.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.rol === "usuario" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-5 py-3.5 text-[14px] leading-relaxed rounded-2xl ${
                  m.rol === "usuario"
                    ? "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white rounded-br-md shadow-lg shadow-emerald-500/20"
                    : "bg-white/80 text-graphite-brand rounded-bl-md border border-white/60"
                }`}
              >
                {m.texto}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/80 rounded-2xl rounded-bl-md px-5 py-3.5 border border-white/60">
                <span className="inline-flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.3s]" />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        <div className="px-6 pb-4">
          <div className="flex gap-2 flex-wrap">
            {sugerencias.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="h-9 px-4 rounded-xl text-[13px] font-medium bg-gradient-to-r from-purple-50 to-purple-100/50 text-purple-600 hover:from-purple-100 hover:to-purple-150 transition-all border border-purple-100"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-white/20 p-4 bg-white/30">
          <form onSubmit={enviar} className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregúntale a tu asesor..."
              className="input flex-1 h-12"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn btn-primary h-12 px-6 disabled:opacity-40"
            >
              {loading ? <span className="spinner" /> : "Enviar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
