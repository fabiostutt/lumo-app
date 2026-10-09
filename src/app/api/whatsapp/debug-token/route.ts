import { NextRequest, NextResponse } from "next/server";

// Endpoint de diagnóstico TEMPORÁRIO — não chama nada que envie mensagem pra
// ninguém, só consulta a própria Graph API pra validar a configuração
// (token, phone number, templates). Protegido pelo mesmo CRON_SECRET já
// usado em /api/cron/session-reminders — sem ele configurado, o endpoint
// fica aberto, então em produção CRON_SECRET deve sempre existir.
// Remover depois que o problema de envio for resolvido.

const GRAPH_VERSION = "v21.0";

async function safeGet(url: string) {
  try {
    const res = await fetch(url);
    const body = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(body);
    } catch {
      json = body;
    }
    return { ok: res.ok, status: res.status, body: json };
  } catch (err) {
    return { ok: false, status: 0, body: { error: err instanceof Error ? err.message : String(err) } };
  }
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  // Aceita o secret tanto no header Authorization (uso normal de API) quanto
  // em ?secret= na própria URL — pra dar pra abrir isso direto no navegador,
  // sem precisar de terminal nem de um cliente HTTP.
  const secretParam = request.nextUrl.searchParams.get("secret");
  const isAuthorized =
    !!cronSecret && (authHeader === `Bearer ${cronSecret}` || secretParam === cronSecret);
  if (!isAuthorized) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const wabaId = process.env.WABA_ID;

  if (!token) {
    return NextResponse.json({ error: "WHATSAPP_TOKEN não está configurado" }, { status: 500 });
  }

  // 1) O token é válido? De que tipo, com quais escopos, pra qual app?
  const tokenDebug = phoneNumberId
    ? await safeGet(
        `https://graph.facebook.com/${GRAPH_VERSION}/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(token)}`
      )
    : { ok: false, status: 0, body: { error: "sem token pra consultar" } };

  // 2) O token enxerga o número de telefone configurado? Esse é o teste mais
  // direto — reproduz exatamente a mesma autenticação usada pra enviar
  // mensagem, mas sem mandar nada pra ninguém.
  const phoneNumber = phoneNumberId
    ? await safeGet(
        `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status&access_token=${encodeURIComponent(token)}`
      )
    : { ok: false, status: 0, body: { error: "WHATSAPP_PHONE_NUMBER_ID não está configurado" } };

  // 3) Os templates que o código espera (WHATSAPP_TEMPLATE_NAME etc.) existem
  // e estão APPROVED nessa WABA, pelo nome exato configurado?
  const templates = wabaId
    ? await safeGet(
        `https://graph.facebook.com/${GRAPH_VERSION}/${wabaId}/message_templates?fields=name,status,language&limit=100&access_token=${encodeURIComponent(token)}`
      )
    : { ok: false, status: 0, body: { error: "WABA_ID não está configurado" } };

  return NextResponse.json({
    expectedConfig: {
      phoneNumberId: phoneNumberId ?? null,
      wabaId: wabaId ?? null,
      templateNames: {
        confirmation: process.env.WHATSAPP_TEMPLATE_NAME || "meeting_confirmation",
        reminder: process.env.WHATSAPP_TEMPLATE_REMINDER_NAME || "meeting_reminder",
        cancelled: process.env.WHATSAPP_TEMPLATE_CANCELLED_NAME || "meeting_cancelled",
      },
    },
    tokenDebug,
    phoneNumber,
    templates,
  });
}
