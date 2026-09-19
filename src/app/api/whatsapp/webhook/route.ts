import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Verificação inicial do webhook (Meta chama isso uma vez ao salvar a config)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

// Recebe respostas de botão (Confirmar/Cancelar) e atualizações de status de
// entrega ("sent"/"delivered"/"read"/"failed") da mensagem de confirmação.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[whatsapp webhook] Payload recebido:", JSON.stringify(body));

    const value = body?.entry?.[0]?.changes?.[0]?.value;
    const statuses = value?.statuses as
      | Array<{ id?: string; status?: string; timestamp?: string; recipient_id?: string; errors?: unknown }>
      | undefined;

    if (statuses?.length) {
      for (const status of statuses) {
        console.log("[whatsapp webhook] Status de entrega:", status);
      }
    }

    const message = value?.messages?.[0];

    if (message?.type === "button") {
      const payload = message.button?.payload as string | undefined;

      if (payload) {
        const [action, sessionId] = payload.split("_");

        if (sessionId && (action === "confirm" || action === "cancel")) {
          const supabaseAdmin = createAdminClient();
          await supabaseAdmin
            .from("sessions")
            .update({ status: action === "confirm" ? "confirmada" : "cancelada" })
            .eq("id", sessionId);
        }
      }
    }
  } catch (err) {
    console.error("Erro processando webhook do WhatsApp:", err);
  }

  return NextResponse.json({ received: true });
}
