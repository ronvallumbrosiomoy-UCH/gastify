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
        <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
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
        <h1 className="text-[28px] font-bold tracking-tight text-graphite-brand">
          Asesor financiero
        </h1>
        <p className="text-[15px] text-gray-brand mt-1">
          Pregúntale a Gastify sobre tus gastos.
        </p>
      </div>

      <div className="card-elevated flex flex-col h-[65vh] overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {mensajes.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.rol === "usuario" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 text-[14px] leading-relaxed rounded-2xl ${
                  m.rol === "usuario"
                    ? "bg-emerald-500 text-white rounded-br-md"
                    : "bg-black/[0.04] text-graphite-brand rounded-bl-md"
                }`}
              >
                {m.texto}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-black/[0.04] rounded-2xl rounded-bl-md px-4 py-3">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.3s]" />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        <div className="px-5 pb-3">
          <div className="flex gap-2 flex-wrap">
            {sugerencias.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="h-8 px-3 rounded-lg text-[12px] font-medium bg-black/[0.04] text-gray-brand hover:bg-black/[0.07] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-black/5 p-4">
          <form onSubmit={enviar} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregúntale a tu asesor..."
              className="input flex-1 h-11"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn btn-primary h-11 px-5 disabled:opacity-40"
            >
              {loading ? <span className="spinner" /> : "Enviar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
