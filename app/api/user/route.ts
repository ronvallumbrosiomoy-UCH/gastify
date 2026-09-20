import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const client = await clientPromise;
    const db = client.db("gastify");
    const user = await db.collection("users").findOne(
      { email: session.user.email },
      { projection: { password: 0 } }
    );
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const body = await req.json();
    const { name, phone, country } = body;
    const client = await clientPromise;
    const db = client.db("gastify");
    const update: Record<string, any> = {};
    if (name) update.name = name;
    if (phone) update.phone = phone;
    if (country) update.country = country;
    await db.collection("users").updateOne(
      { email: session.user.email },
      { $set: update }
    );
    const user = await db.collection("users").findOne(
      { email: session.user.email },
      { projection: { password: 0 } }
    );
    return NextResponse.json(user);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}