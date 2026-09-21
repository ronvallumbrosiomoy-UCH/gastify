import { NextResponse } from "next/server";
import { exchangeCode } from "@/lib/gmail/service";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      return NextResponse.redirect(
        new URL(`/dashboard?gmail=error&msg=${encodeURIComponent("Google denied access: " + errorParam)}`, baseUrl)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/dashboard?gmail=error&msg=missing_code_or_state", baseUrl)
      );
    }

    let tokens;
    try {
      tokens = await exchangeCode(code);
    } catch (tokenErr: any) {
      return NextResponse.redirect(
        new URL(`/dashboard?gmail=error&msg=${encodeURIComponent("Token exchange failed: " + tokenErr.message)}`, baseUrl)
      );
    }

    if (!tokens.access_token) {
      return NextResponse.redirect(
        new URL("/dashboard?gmail=error&msg=no_access_token", baseUrl)
      );
    }

    let userId: ObjectId;
    try {
      userId = new ObjectId(state);
    } catch {
      return NextResponse.redirect(
        new URL(`/dashboard?gmail=error&msg=invalid_user_id`, baseUrl)
      );
    }

    const client = await clientPromise;
    const db = client.db("gastify");
    await db.collection("gmailconnections").updateOne(
      { userId },
      {
        $set: {
          userId,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          connectedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.redirect(
      new URL("/dashboard?gmail=connected", baseUrl)
    );
  } catch (e: any) {
    return NextResponse.redirect(
      new URL(`/dashboard?gmail=error&msg=${encodeURIComponent("Unknown error: " + e.message)}`, baseUrl)
    );
  }
}
