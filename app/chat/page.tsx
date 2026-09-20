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
    return <div className="text-center py-20 text-text-secondary">Cargando...</div>;
  }
  if (status === "unauthenticated") return null;

  const sugerencias = [
    "¿En qué gasté más este mes?",
    "¿Cuánto gasté en total?",
    "¿Qué gastos fijos tengo?",
    "¿Cómo comparo con el mes pasado?",
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-graphite-brand">💬 Asesor financiero</h1>
        <p className="text-text-secondary mt-1">
          Pregúntale a Gastify sobre tus gastos y recibe respuestas con tus datos reales.
        </p>
      </div>

      <div className="bg-card border border-card-border rounded-2xl flex flex-col h-[60vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mensajes.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.rol === "usuario" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.rol === "usuario"
                    ? "bg-emerald-brand text-white"
                    : "bg-surface border border-card-border text-graphite-brand"
                }`}
              >
                {m.texto}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-surface border border-card-border rounded-2xl px-4 py-2.5">
                <span className="inline-flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-brand animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-purple-brand animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-purple-brand animate-bounce [animation-delay:0.4s]" />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-card-border p-3">
          <div className="flex gap-2 flex-wrap mb-3">
            {sugerencias.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setInput(s);
                }}
                className="px-3 py-1.5 text-xs rounded-full border border-gray-200 text-text-secondary hover:border-purple-brand hover:text-purple-brand transition-all"
              >
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={enviar} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregúntale a tu asesor financiero..."
              className="flex-1 px-4 py-3 rounded-xl border border-card-border focus:outline-none focus:border-purple-brand focus:ring-2 focus:ring-purple-brand/20 bg-background transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-3 rounded-xl bg-purple-brand text-white font-medium hover:bg-purple-brand/90 disabled:opacity-50 transition-all"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}