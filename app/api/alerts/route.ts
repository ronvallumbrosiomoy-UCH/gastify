import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const client = await clientPromise;
    const db = client.db("gastify");
    const userId = new ObjectId(session.user.id);

    const now = new Date();
    const anio = now.getFullYear();
    const mes = now.getMonth() + 1;

    // Gastos del mes actual
    const inicioMes = new Date(anio, mes - 1, 1);
    const finMes = new Date(anio, mes, 1);

    const mesActual = await db.collection("transactions").find({
      userId,
      tipo: "gasto",
      fecha: { $gte: inicioMes, $lt: finMes },
    }).toArray();

    // Promedio histórico (últimos 3 meses)
    const inicio3 = new Date(anio, mes - 3, 1);
    const historial = await db.collection("transactions").find({
      userId,
      tipo: "gasto",
      fecha: { $gte: inicio3, $lt: inicioMes },
    }).toArray();

    // Agregar por categoría
    const porCategoriaActual: Record<string, number> = {};
    for (const t of mesActual) {
      porCategoriaActual[t.categoria] = (porCategoriaActual[t.categoria] || 0) + t.monto;
    }
    const porCategoriaHist: Record<string, number> = {};
    for (const t of historial) {
      porCategoriaHist[t.categoria] = (porCategoriaHist[t.categoria] || 0) + t.monto;
    }

    const alertas: { categoria: string; actual: number; promedio: number; pct: number }[] = [];

    for (const [categoria, total] of Object.entries(porCategoriaActual)) {
      const promedioMensual = (porCategoriaHist[categoria] || 0) / 3;
      if (promedioMensual > 0) {
        const pct = ((total - promedioMensual) / promedioMensual) * 100;
        if (pct > 20) {
          alertas.push({ categoria, actual: total, promedio: promedioMensual, pct });
        }
      }
    }

    alertas.sort((a, b) => b.pct - a.pct);

    return NextResponse.json({ alertas });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}