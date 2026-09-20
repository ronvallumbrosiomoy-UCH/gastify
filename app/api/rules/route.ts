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
    const rules = await db
      .collection("rules")
      .find({ userId: new ObjectId(session.user.id) })
      .sort({ prioridad: -1 })
      .toArray();
    return NextResponse.json(rules);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
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
      userId: new ObjectId(session.user.id),
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