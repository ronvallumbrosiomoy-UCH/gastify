import { NextResponse } from "next/server";
import { getMongoUserId } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const userId = await getMongoUserId();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const client = await clientPromise;
    const db = client.db("gastify");
    const userIdObj = new ObjectId(userId);

    const now = new Date();
    const anio = now.getFullYear();
    const mes = now.getMonth() + 1;

    const startMes = new Date(anio, mes - 1, 1);
    const endMes = new Date(anio, mes, 1);
    const startPrev = new Date(anio, mes - 2, 1);
    const endPrev = new Date(anio, mes - 1, 1);

    const [actual, anterior] = await Promise.all([
      db.collection("transactions").find({ userId: userIdObj, fecha: { $gte: startMes, $lt: endMes } }).toArray(),
      db.collection("transactions").find({ userId: userIdObj, fecha: { $gte: startPrev, $lt: endPrev } }).toArray(),
    ]);

    const totalActual = actual.reduce((s, t) => s + t.monto, 0);
    const totalAnterior = anterior.reduce((s, t) => s + t.monto, 0);

    const pct = totalAnterior > 0 ? ((totalActual - totalAnterior) / totalAnterior) * 100 : 0;

    const porCategoria: Record<string, number> = {};
    for (const t of actual) {
      porCategoria[t.categoria] = (porCategoria[t.categoria] || 0) + t.monto;
    }
    const categorias = Object.entries(porCategoria)
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total);

    const diasTranscurridos = Math.max(now.getDate(), 1);
    const diarioPromedio = totalActual / diasTranscurridos;

    const fijos = actual
      .filter((t) => t.es_fijo)
      .map((t) => ({ comercio: t.comercio, monto: t.monto }));

    const insights: string[] = [];
    if (pct < 0) {
      insights.push(`Llevas ${Math.abs(pct).toFixed(0)}% menos gastado que el mes pasado. ¡Buen trabajo!`);
    } else if (pct > 0) {
      insights.push(`Este mes llevas ${pct.toFixed(0)}% más que el mes pasado.`);
    }
    const topCat = categorias[0];
    if (topCat) {
      insights.push(`Tu mayor gasto es ${topCat.categoria} con S/ ${topCat.total.toFixed(2)}.`);
    }
    if (fijos.length > 0) {
      insights.push(`Tienes ${fijos.length} gastos fijos detectados.`);
    }
    const proyeccion = diarioPromedio * new Date(anio, mes, 0).getDate();
    insights.push(`Proyección: gastarás ~S/ ${proyeccion.toFixed(0)} a fin de mes.`);

    return NextResponse.json({
      totalActual,
      totalAnterior,
      pct,
      diarioPromedio,
      categorias,
      fijos,
      insights,
      mes,
      anio,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
