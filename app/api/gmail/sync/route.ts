import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getGmailClient } from "@/lib/gmail/service";
import {
  esRemitenteBancario,
  getBancoFromEmail,
  categorizarPorComercio,
  type EmailMessage,
} from "@/lib/gmail/parsers";

const BASE64_HEADER = /^=\?UTF-8\?/;

function base64UrlDecode(data: string): string {
  const pad = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(pad, "base64").toString("utf-8");
}

function extractPlainText(payload: any): string {
  if (!payload) return "";
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return base64UrlDecode(payload.body.data);
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      const text = extractPlainText(part);
      if (text) return text;
    }
  }
  return "";
}

function decodeHeaderValue(value: string): string {
  if (BASE64_HEADER.test(value)) {
    const match = value.match(/\?B\?(.*?)\?=/);
    if (match) return base64UrlDecode(match[1]);
  }
  return value;
}

async function fetchMessages(gmail: any, query: string, max: number): Promise<EmailMessage[]> {
  const res = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: max,
  });
  const messages = res.data.messages || [];
  const results: EmailMessage[] = [];

  for (const msg of messages) {
    try {
      const detail = await gmail.users.messages.get({ userId: "me", id: msg.id, format: "full" });
      const headers = detail.data.payload?.headers || [];
      const getHeader = (name: string) => {
        const h = headers.find((x: any) => x.name?.toLowerCase() === name.toLowerCase());
        return h ? decodeHeaderValue(h.value || "") : "";
      };
      results.push({
        id: msg.id,
        from: getHeader("From"),
        subject: getHeader("Subject"),
        body: extractPlainText(detail.data.payload),
        date: getHeader("Date"),
      });
    } catch {}
  }
  return results;
}

function parseMontoPeruano(body: string): number | null {
  const patterns = [
    /S\/\s?(\d{1,6}[.,]\d{2})/,
    /S\/\s?(\d{1,6})/,
    /soles\s*(\d{1,6}[.,]\d{2})/i,
    /monto:?\s*S\/?\s*(\d{1,6}[.,]\d{2})/i,
    /importe:?\s*S\/?\s*(\d{1,6}[.,]\d{2})/i,
    /(\d{1,6}[.,]\d{2})\s*PEN/i,
    /total:?\s*S\/?\s*(\d{1,6}[.,]\d{2})/i,
    /cargo:?\s*S\/?\s*(\d{1,6}[.,]\d{2})/i,
    /retiro:?\s*S\/?\s*(\d{1,6}[.,]\d{2})/i,
    /transferencia:?\s*S\/?\s*(\d{1,6}[.,]\d{2})/i,
    /pago:?\s*S\/?\s*(\d{1,6}[.,]\d{2})/i,
  ];

  for (const pattern of patterns) {
    const match = body.match(pattern);
    if (match) {
      const montoStr = match[1].replace(",", ".");
      const monto = parseFloat(montoStr);
      if (!isNaN(monto) && monto > 0 && monto < 100000) return monto;
    }
  }
  return null;
}

function parseComercio(body: string, subject: string): string {
  const patterns = [
    /comercio:?\s*(.+)/i,
    /tienda:?\s*(.+)/i,
    /establecimiento:?\s*(.+)/i,
    /lugar:?\s*(.+)/i,
    /en:?\s*(.+)/i,
    /donde:?\s*(.+)/i,
    /transaction at\s+(.+)/i,
    /at\s+(.+?)(?:\s+on|\s*$)/i,
  ];

  for (const pattern of patterns) {
    const match = body.match(pattern);
    if (match) {
      let comercio = match[1].trim();
      comercio = comercio.replace(/[.\n].*$/, "").trim();
      if (comercio.length > 3 && comercio.length < 80) return comercio;
    }
  }

  if (subject) {
    const subMatch = subject.match(/(?:compra|pago|retiro|transferencia|cargo)\s+(?:en|de|a)\s+(.+)/i);
    if (subMatch) return subMatch[1].trim();
  }

  const lines = body.split("\n").map((l) => l.trim()).filter((l) => l.length > 3 && l.length < 60);
  for (const line of lines) {
    if (line.match(/^[A-Z\s&]+$/) && !line.match(/BANCO|TARJETA|CUENTA|NUMERO|FECHA|HORA|S\/|PEN/i)) {
      return line;
    }
  }

  return "Comercio desconocido";
}

function parseUltimos4(body: string): string | undefined {
  const patterns = [
    /tarjeta\s*\*{0,4}(\d{4})/i,
    /card\s*\*{0,4}(\d{4})/i,
    /cuenta\s*\*{0,4}(\d{4})/i,
    /xxxx\s*(\d{4})/i,
    /\*{4}\s*(\d{4})/i,
    /final\s*(\d{4})/i,
    /nro\s*(?:tarjeta|cuenta)?\s*\*{0,4}(\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = body.match(pattern);
    if (match) return match[1];
  }
  return undefined;
}

function parseFechaPeruano(body: string, emailDate: string): Date {
  const patterns = [
    /(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2})/,
    /(\d{2}-\d{2}-\d{4})\s+(\d{2}:\d{2})/,
    /(\d{4}-\d{2}-\d{2})/,
    /(\d{2}\/\d{2}\/\d{4})/,
  ];

  for (const pattern of patterns) {
    const match = body.match(pattern);
    if (match) {
      const dateStr = match[1].replace(/-/g, "/");
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;
        const date = new Date(`${yyyy}-${mm}-${dd}T12:00:00`);
        if (!isNaN(date.getTime())) return date;
      }
    }
  }

  if (emailDate) {
    const date = new Date(emailDate);
    if (!isNaN(date.getTime())) return date;
  }

  return new Date();
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("gastify");
    const conn = await db.collection("gmailconnections").findOne({
      userId: new ObjectId(session.user.id),
    });
    if (!conn) {
      return NextResponse.json({ error: "Gmail no conectado" }, { status: 400 });
    }

    const gmail = await getGmailClient(conn.accessToken, conn.refreshToken);
    const remitentes = (conn.remitentesPermitidos?.length
      ? conn.remitentesPermitidos
      : ["BCP", "BBVA", "Interbank", "Scotiabank", "MiBank"]
    ).join(" OR ");

    const query = `from:(${remitentes}) newer_than:30d`;
    const emails = await fetchMessages(gmail, query, 100);
    const bancarios = emails.filter((e) => esRemitenteBancario(e.from));

    const existingIds = await db
      .collection("transactions")
      .find({ userId: new ObjectId(session.user.id), gmailMessageId: { $exists: true } })
      .project({ gmailMessageId: 1 })
      .toArray();
    const existingSet = new Set(existingIds.map((d) => d.gmailMessageId));

    let creadas = 0;
    let duplicadas = 0;

    for (const email of bancarios) {
      if (existingSet.has(email.id)) {
        duplicadas++;
        continue;
      }

      const banco = getBancoFromEmail(email.from);
      const monto = parseMontoPeruano(email.body);
      if (!monto) continue;

      const comercio = parseComercio(email.body, email.subject);
      const categoria = categorizarPorComercio(comercio);
      const ultimos4 = parseUltimos4(email.body);
      const fecha = parseFechaPeruano(email.body, email.date);

      await db.collection("transactions").insertOne({
        userId: new ObjectId(session.user.id),
        gmailMessageId: email.id,
        monto,
        comercio,
        categoria,
        fecha,
        moneda: "PEN",
        banco,
        ultimos4,
        tipo: "gasto",
        empresa_o_personal: "personal",
        es_fijo: false,
        procesadoPor: "gmail",
        createdAt: new Date(),
      });
      creadas++;
    }

    await db.collection("gmailconnections").updateOne(
      { userId: new ObjectId(session.user.id) },
      { $set: { lastSyncAt: new Date() } }
    );

    return NextResponse.json({
      ok: true,
      procesados: bancarios.length,
      creadas,
      duplicadas,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
