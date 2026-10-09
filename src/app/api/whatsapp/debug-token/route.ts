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

  // 3) Os templates que o código espera (WHATSAPP_TEMPLATE_NAME etc.) existem,
  // estão APPROVED nessa WABA, e — principalmente — "components" mostra a
  // estrutura exata (quantas variáveis no corpo, quais botões, nessa ordem)
  // pra comparar com o que src/lib/whatsapp.ts está montando.
  const templates = wabaId
    ? await safeGet(
        `https://graph.facebook.com/${GRAPH_VERSION}/${wabaId}/message_templates?fields=name,status,language,components&limit=100&access_token=${encodeURIComponent(token)}`
      )
    : { ok: false, status: 0, body: { error: "WABA_ID não está configurado" } };

  // 4) Teste real e opcional: ?testSendTo=5511999999999 manda de fato o
  // template de confirmação pra esse número, com dados fictícios, e devolve
  // a resposta crua da Graph API — reproduz exatamente a chamada que
  // create-session.ts faz, sem precisar criar uma sessão de verdade.
  const testSendTo = request.nextUrl.searchParams.get("testSendTo");
  let testSend: unknown = null;
  if (testSendTo && phoneNumberId) {
    const to = testSendTo.replace(/\D/g, "");
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: process.env.WHATSAPP_TEMPLATE_NAME || "meeting_confirmation",
          language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "pt_BR" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: "Teste" },
                { type: "text", text: "01/01" },
                { type: "text", text: "10:00" },
              ],
            },
            {
              type: "button",
              sub_type: "quick_reply",
              index: "0",
              parameters: [{ type: "payload", payload: "confirm_debug" }],
            },
            {
              type: "button",
              sub_type: "quick_reply",
              index: "1",
              parameters: [{ type: "payload", payload: "cancel_debug" }],
            },
          ],
        },
      }),
    });
    const resBody = await res.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(resBody);
    } catch {
      parsed = resBody;
    }
    testSend = { ok: res.ok, status: res.status, body: parsed };
  }

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
    testSend,
  });
}
