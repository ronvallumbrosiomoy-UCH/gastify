import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
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
  }
  return results;
}

export async function POST() {
  try {
    const session = await getServerSession();
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
      : ["BCP", "BBVA", "Interbank", "Scotiabank"]
    ).join(" OR ");

    const query = `from:(${remitentes}) newer_than:30d`;
    const emails = await fetchMessages(gmail, query, 50);

    const bancarios = emails.filter((e) => esRemitenteBancario(e.from));
    let creadas = 0;

    for (const email of bancarios) {
      const banco = getBancoFromEmail(email.from);
      // Extracción básica de montos S/ xx.xx del cuerpo
      const montoMatch = email.body.match(/S\/\s?(\d+[.,]\d{2})|S\/\s?(\d+)/);
      if (!montoMatch) continue;
      const montoStr = (montoMatch[1] || montoMatch[2] || "").replace(",", ".");
      const monto = parseFloat(montoStr);
      if (isNaN(monto)) continue;

      // Extraer comercio (línea con "comercio" o segunda línea después del monto)
      const lines = email.body.split("\n").map((l) => l.trim()).filter(Boolean);
      let comercio = lines[3] || email.subject || "Comercio";
      const comercioMatch = email.body.match(/Comercio:?\s*([^\n]+)/i);
      if (comercioMatch) comercio = comercioMatch[1].trim();

      const categoria = categorizarPorComercio(comercio);
      const ultimos4 = email.body.match(/(?:tarjeta|card)\s*\*{0,4}(\d{4})/i)?.[1];

      await db.collection("transactions").insertOne({
        userId: new ObjectId(session.user.id),
        monto,
        comercio,
        categoria,
        fecha: email.date ? new Date(email.date) : new Date(),
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

    return NextResponse.json({ ok: true, procesados: bancarios.length, creadas });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}