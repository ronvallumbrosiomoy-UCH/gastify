import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function getMongoUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  if (session.user.id && ObjectId.isValid(session.user.id)) {
    return session.user.id;
  }

  if (session.user.email) {
    const client = await clientPromise;
    const db = client.db("gastify");
    const user = await db.collection("users").findOne({ email: session.user.email });
    if (user) return user._id.toString();
  }

  return null;
}
