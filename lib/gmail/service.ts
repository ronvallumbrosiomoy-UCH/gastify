import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID!;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET!;
const GMAIL_REDIRECT_URI =
  process.env.GMAIL_REDIRECT_URI || "http://localhost:3000/api/gmail/oauth/callback";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

export function getOAuthClient() {
  return new OAuth2Client(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REDIRECT_URI);
}

export function getAuthUrl(userId: string) {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state: userId,
  });
}

export async function exchangeCode(code: string) {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  return tokens;
}

export async function getGmailClient(accessToken: string, refreshToken?: string) {
  const client = getOAuthClient();
  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      try {
        const { default: clientPromise } = await import("@/lib/mongodb");
        const { ObjectId } = await import("mongodb");
        const mdb = await clientPromise;
        const db = mdb.db("gastify");
        const conn = await db.collection("gmailconnections").findOne({
          "accessToken": accessToken,
        });
        if (conn) {
          await db.collection("gmailconnections").updateOne(
            { _id: conn._id },
            { $set: { accessToken: tokens.access_token } }
          );
        }
      } catch {}
    }
  });

  return google.gmail({ version: "v1", auth: client });
}
