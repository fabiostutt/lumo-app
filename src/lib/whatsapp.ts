function formatPhoneForWhatsApp(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

type TemplateComponent = Record<string, unknown>;

async function sendWhatsAppTemplate({
  toRaw,
  templateName,
  bodyParams,
  extraComponents = [],
  logContext,
}: {
  toRaw: string;
  templateName: string;
  bodyParams: string[];
  extraComponents?: TemplateComponent[];
  logContext: Record<string, unknown>;
}) {
  const to = formatPhoneForWhatsApp(toRaw);
  const url = `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  console.log("[whatsapp] Enviando mensagem de template", { templateName, toRaw, toFormatted: to, ...logContext });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "pt_BR" },
        components: [
          {
            type: "body",
            parameters: bodyParams.map((text) => ({ type: "text", text })),
          },
          ...extraComponents,
        ],
      },
    }),
  });

  const resBody = await res.text();

  if (!res.ok) {
    console.error("[whatsapp] Erro retornado pela Graph API", {
      templateName,
      status: res.status,
      body: resBody,
      ...logContext,
    });
    throw new Error(`WhatsApp API error: ${resBody}`);
  }

  const json = JSON.parse(resBody);
  console.log("[whatsapp] Mensagem aceita pela Graph API", {
    templateName,
    wamid: json?.messages?.[0]?.id,
    waId: json?.contacts?.[0]?.wa_id,
    ...logContext,
  });

  return json;
}

type SendConfirmationParams = {
  toRaw: string;
  clientName: string;
  date: string; // "dd/mm"
  time: string; // "HH:mm"
  sessionId: string;
};

export async function sendSessionConfirmationMessage({
  toRaw,
  clientName,
  date,
  time,
  sessionId,
}: SendConfirmationParams) {
  return sendWhatsAppTemplate({
    toRaw,
    templateName: process.env.WHATSAPP_TEMPLATE_NAME || "meeting_confirmation",
    bodyParams: [clientName, date, time],
    extraComponents: [
      {
        type: "button",
        sub_type: "quick_reply",
        index: "0",
        parameters: [{ type: "payload", payload: `confirm_${sessionId}` }],
      },
      {
        type: "button",
        sub_type: "quick_reply",
        index: "1",
        parameters: [{ type: "payload", payload: `cancel_${sessionId}` }],
      },
    ],
    logContext: { sessionId, clientName, date, time },
  });
}

type SendReminderParams = {
  toRaw: string;
  clientName: string;
  date: string; // "dd/mm"
  time: string; // "HH:mm"
  sessionId: string;
};

export async function sendSessionReminderMessage({ toRaw, clientName, date, time, sessionId }: SendReminderParams) {
  return sendWhatsAppTemplate({
    toRaw,
    templateName: process.env.WHATSAPP_TEMPLATE_REMINDER_NAME || "meeting_reminder",
    bodyParams: [clientName, date, time],
    logContext: { sessionId, clientName, date, time },
  });
}

type SendCancelledParams = {
  toRaw: string;
  clientName: string;
  date: string; // "dd/mm"
  time: string; // "HH:mm"
  sessionId: string;
};

export async function sendSessionCancelledMessage({ toRaw, clientName, date, time, sessionId }: SendCancelledParams) {
  return sendWhatsAppTemplate({
    toRaw,
    templateName: process.env.WHATSAPP_TEMPLATE_CANCELLED_NAME || "meeting_cancelled",
    bodyParams: [clientName, date, time],
    logContext: { sessionId, clientName, date, time },
  });
}
