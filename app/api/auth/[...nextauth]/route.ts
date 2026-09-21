import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const client = await clientPromise;
        const db = client.db("gastify");
        const user = await db.collection("users").findOne({
          email: credentials?.email,
        });
        if (!user) return null;
        const valid = await bcrypt.compare(
          credentials!.password!,
          user.password as string
        );
        return valid
          ? { id: user._id.toString(), email: user.email, name: user.name }
          : null;
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user?.email) {
        try {
          const client = await clientPromise;
          const db = client.db("gastify");
          const existing = await db.collection("users").findOne({ email: user.email });
          if (!existing) {
            const result = await db.collection("users").insertOne({
              name: user.name || "",
              email: user.email,
              image: user.image,
              role: "user",
              country: "PE",
              streakDays: 0,
              createdAt: new Date(),
            });
            user.id = result.insertedId.toString();
          } else {
            user.id = existing._id.toString();
          }
        } catch {}
      }
      return true;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "user";
        token.email = user.email;
      }
      if (token.email && !token.mongoId) {
        try {
          const client = await clientPromise;
          const db = client.db("gastify");
          const dbUser = await db.collection("users").findOne({ email: token.email });
          if (dbUser) {
            token.mongoId = dbUser._id.toString();
            token.role = dbUser.role || "user";
          }
        } catch {}
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.user.id = token.mongoId || token.id;
      session.user.role = token.role as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
