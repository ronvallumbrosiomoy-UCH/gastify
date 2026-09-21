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
      texto: "¡Hola! Soy tu asesor financiero. Pregúntame sobre tus gastos, por ejemplo: ¿en qué gasté más este mes?",
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
        { rol: "ia", texto: json.respuesta || json.error || "Error al responder" },
      ]);
    } catch {
      setMensajes((m) => [...m, { rol: "ia", texto: "Error de conexión" }]);
    } finally {
      setLoading(false);
    }
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

  const sugerencias = [
    "¿En qué gasté más este mes?",
    "¿Cuánto gasté en total?",
    "¿Qué gastos fijos tengo?",
    "¿Cómo comparo con el mes pasado?",
  ];

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-graphite-brand tracking-tight">
          💬 Asesor financiero
        </h1>
        <p className="text-text-secondary mt-2 text-lg">
          Pregúntale a Gastify sobre tus gastos y recibe respuestas con tus datos reales.
        </p>
      </div>

      {/* Chat Container */}
      <div className="glass rounded-3xl flex flex-col h-[65vh] overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {mensajes.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.rol === "usuario" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                  m.rol === "usuario"
                    ? "bg-emerald-brand text-white shadow-md"
                    : "bg-white border border-card-border text-graphite-brand shadow-sm"
                }`}
              >
                {m.texto}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-card-border rounded-2xl px-5 py-3 shadow-sm">
                <span className="inline-flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-brand animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-purple-brand animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-purple-brand animate-bounce [animation-delay:0.4s]" />
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
                className="px-4 py-2 text-xs font-medium rounded-xl glass text-text-secondary hover:text-purple-brand hover:border-purple-brand transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-card-border p-4 bg-white/30">
          <form onSubmit={enviar} className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregúntale a tu asesor financiero..."
              className="apple-input flex-1"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="apple-button bg-purple-brand text-white hover:bg-purple-brand/90 disabled:opacity-50 px-6"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Enviar"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
