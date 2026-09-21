import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { GoogleGenerativeAI } from "@google/generative-ai";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function queryTransactions(userId: string, params: any) {
  const client = await clientPromise;
  const db = client.db("gastify");
  const filter: Record<string, any> = { userId: new ObjectId(userId) };

  const { mes, anio, categoria, limite = 10 } = params;
  if (mes && anio) {
    filter.fecha = {
      $gte: new Date(anio, mes - 1, 1),
      $lt: new Date(anio, mes, 1),
    };
  }
  if (categoria) filter.categoria = categoria;

  const docs = await db
    .collection("transactions")
    .find(filter)
    .sort({ fecha: -1 })
    .limit(Math.min(Number(limite), 50))
    .toArray();

  return docs.map((d) => ({
    monto: d.monto,
    comercio: d.comercio,
    categoria: d.categoria,
    fecha: d.fecha,
    banco: d.banco,
  }));
}

async function getMonthlyTotals(userId: string) {
  const client = await clientPromise;
  const db = client.db("gastify");
  const userIdObj = new ObjectId(userId);
  const now = new Date();
  const mes = now.getMonth() + 1;
  const anio = now.getFullYear();

  const [actual, anterior] = await Promise.all([
    db.collection("transactions").find({
      userId: userIdObj,
      fecha: { $gte: new Date(anio, mes - 1, 1), $lt: new Date(anio, mes, 1) },
    }).toArray(),
    db.collection("transactions").find({
      userId: userIdObj,
      fecha: { $gte: new Date(anio, mes - 2, 1), $lt: new Date(anio, mes - 1, 1) },
    }).toArray(),
  ]);

  const totalActual = actual.reduce((s, t) => s + t.monto, 0);
  const totalAnterior = anterior.reduce((s, t) => s + t.monto, 0);
  const porCategoria: Record<string, number> = {};
  for (const t of actual) {
    porCategoria[t.categoria] = (porCategoria[t.categoria] || 0) + t.monto;
  }

  return { totalActual, totalAnterior, porCategoria, mes, anio };
}

const tools = [
  {
    functionDeclarations: [
      {
        name: "get_transactions",
        description: "Consulta transacciones del usuario con filtros",
        parameters: {
          type: "OBJECT" as const,
          properties: {
            mes: { type: "INTEGER" as const, description: "Mes (1-12)" },
            anio: { type: "INTEGER" as const, description: "Año" },
            categoria: { type: "STRING" as const, description: "Categoría del gasto" },
            limite: { type: "INTEGER" as const, description: "Límite de resultados" },
          },
        },
      },
      {
        name: "get_monthly_totals",
        description: "Obtiene totales mensuales y categorías del usuario",
        parameters: { type: "OBJECT" as const, properties: {} },
      },
    ],
  },
];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    let userId = session.user.id;
    if (!userId && session.user.email) {
      const client = await clientPromise;
      const db = client.db("gastify");
      const user = await db.collection("users").findOne({ email: session.user.email });
      if (user) userId = user._id.toString();
    }
    if (!userId) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
    }

    const chat = model.startChat({
      tools: tools as any,
      history: [
        {
          role: "user",
          parts: [
            {
              text: "Eres Gastify, un asesor financiero con IA que ayuda al usuario a entender sus gastos. Responde en español de forma breve y clara. Usa las herramientas disponibles para consultar los datos reales del usuario.",
            },
          ],
        },
        {
          role: "model",
          parts: [{ text: "Entendido, seré tu asesor financiero personal. ¿Qué quieres saber de tus gastos?" }],
        },
      ],
    });

    const result = await chat.sendMessage(message);
    let text = result.response.text();

    // Ejecutar function calls
    const calls = result.response.functionCalls?.() || [];
    for (const call of calls) {
      const name = call.name;
      const args = call.args || {};
      let resultData: any;
      if (name === "get_transactions") {
        resultData = await queryTransactions(userId, args);
      } else if (name === "get_monthly_totals") {
        resultData = await getMonthlyTotals(userId);
      } else {
        resultData = { error: "Función desconocida" };
      }

      const fnResult = await chat.sendMessage([
        {
          functionResponse: {
            name,
            response: { result: resultData },
          },
        },
      ]);
      text = fnResult.response.text();
    }

    return NextResponse.json({ respuesta: text });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}