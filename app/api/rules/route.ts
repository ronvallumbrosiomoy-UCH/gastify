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
    const rules = await db
      .collection("rules")
      .find({ userId: new ObjectId(userId) })
      .sort({ prioridad: -1 })
      .toArray();
    return NextResponse.json(rules);
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
    const { nombre, condicion, categoria } = await req.json();
    if (!nombre || !condicion || !categoria) {
      return NextResponse.json(
        { error: "nombre, condicion y categoria son obligatorios" },
        { status: 400 }
      );
    }
    const client = await clientPromise;
    const db = client.db("gastify");
    const result = await db.collection("rules").insertOne({
      userId: new ObjectId(userId),
      nombre,
      condicion,
      categoria,
      prioridad: 0,
      activa: true,
      createdAt: new Date(),
    });
    return NextResponse.json({ id: result.insertedId }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getMongoUserId();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const ruleId = searchParams.get("id");
    if (!ruleId) {
      return NextResponse.json({ error: "ID de regla requerido" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db("gastify");
    await db.collection("rules").deleteOne({
      _id: new ObjectId(ruleId),
      userId: new ObjectId(userId),
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
