import { NextResponse } from "next/server";
import { getMongoUserId } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const userId = await getMongoUserId();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json();

    const client = await clientPromise;
    const db = client.db("gastify");
    const update: Record<string, any> = {};

    const fields = [
      "monto", "comercio", "categoria", "fecha", "moneda", "banco",
      "ultimos4", "tipo", "empresa_o_personal", "es_fijo",
    ];
    for (const f of fields) {
      if (body[f] !== undefined) {
        update[f] = f === "fecha" ? new Date(body[f]) : f === "monto" ? Number(body[f]) : body[f];
      }
    }

    const result = await db.collection("transactions").updateOne(
      { _id: new ObjectId(id), userId: new ObjectId(userId) },
      { $set: { ...update, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const userId = await getMongoUserId();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("gastify");
    const result = await db.collection("transactions").deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
