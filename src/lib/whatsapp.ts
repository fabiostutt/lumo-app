function formatPhoneForWhatsApp(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
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
  const to = formatPhoneForWhatsApp(toRaw);
  const url = `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

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
        name: process.env.WHATSAPP_TEMPLATE_NAME || "session_confirmation",
        language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "pt_BR" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: clientName },
              { type: "text", text: date },
              { type: "text", text: time },
            ],
          },
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
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`WhatsApp API error: ${errText}`);
  }

  return res.json();
}
