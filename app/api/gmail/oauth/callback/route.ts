import { NextResponse } from "next/server";
import { exchangeCode } from "@/lib/gmail/service";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/dashboard?gmail=error", process.env.NEXTAUTH_URL || "http://localhost:3000")
      );
    }

    const tokens = await exchangeCode(code);

    const client = await clientPromise;
    const db = client.db("gastify");
    await db.collection("gmailconnections").updateOne(
      { userId: new ObjectId(state) },
      {
        $set: {
          userId: new ObjectId(state),
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          connectedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.redirect(
      new URL("/dashboard?gmail=connected", process.env.NEXTAUTH_URL || "http://localhost:3000")
    );
  } catch (e: any) {
    return NextResponse.redirect(
      new URL(`/dashboard?gmail=error&msg=${encodeURIComponent(e.message)}`, process.env.NEXTAUTH_URL || "http://localhost:3000")
    );
  }
}