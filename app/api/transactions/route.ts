import { NextResponse } from "next/server";
import { getMongoUserId } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const userId = await getMongoUserId();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const mes = searchParams.get("mes");
    const anio = searchParams.get("anio");
    const categoria = searchParams.get("categoria");
    const tipo = searchParams.get("tipo");
    const empresa_personal = searchParams.get("empresa_personal");

    const client = await clientPromise;
    const db = client.db("gastify");
    const filter: Record<string, any> = { userId: new ObjectId(userId) };
    if (mes && anio) {
      const start = new Date(Number(anio), Number(mes) - 1, 1);
      const end = new Date(Number(anio), Number(mes), 1);
      filter.fecha = { $gte: start, $lt: end };
    }
    if (categoria) filter.categoria = categoria;
    if (tipo) filter.tipo = tipo;
    if (empresa_personal) filter.empresa_o_personal = empresa_personal;

    const transactions = await db
      .collection("transactions")
      .find(filter)
      .sort({ fecha: -1 })
      .toArray();

    return NextResponse.json(transactions);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getMongoUserId();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const body = await req.json();
    const {
      monto,
      comercio,
      categoria,
      fecha,
      moneda = "PEN",
      banco,
      ultimos4,
      tipo = "gasto",
      empresa_o_personal = "personal",
      es_fijo = false,
    } = body;

    if (!monto || !comercio || !categoria || !fecha) {
      return NextResponse.json(
        { error: "monto, comercio, categoria y fecha son obligatorios" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("gastify");
    const result = await db.collection("transactions").insertOne({
      userId: new ObjectId(userId),
      monto: Number(monto),
      comercio,
      categoria,
      fecha: new Date(fecha),
      moneda,
      banco,
      ultimos4,
      tipo,
      empresa_o_personal,
      es_fijo,
      procesadoPor: "manual",
      createdAt: new Date(),
    });

    return NextResponse.json(
      { id: result.insertedId, ok: true },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
