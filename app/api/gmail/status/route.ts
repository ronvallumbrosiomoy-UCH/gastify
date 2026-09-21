import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ connected: false });
    }

    const client = await clientPromise;
    const db = client.db("gastify");
    const conn = await db.collection("gmailconnections").findOne({
      userId: new ObjectId(session.user.id),
    });

    if (!conn) {
      return NextResponse.json({ connected: false });
    }

    return NextResponse.json({
      connected: true,
      connectedAt: conn.connectedAt,
      lastSyncAt: conn.lastSyncAt,
      remitentesPermitidos: conn.remitentesPermitidos || ["BCP", "BBVA", "Interbank", "Scotiabank"],
    });
  } catch (e: any) {
    return NextResponse.json({ connected: false, error: e.message });
  }
}
