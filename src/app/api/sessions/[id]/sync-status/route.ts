import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCalendarEvent, getValidGoogleAccessToken } from "@/lib/google/calendar";
import { sendPushToOwner } from "@/lib/push/server";
import { revalidatePath } from "next/cache";

// Chamado quando o bottom sheet de detalhes da sessão abre: puxa a resposta
// do convidado direto do Google Calendar (accepted/declined) e atualiza o
// status da sessão se ela ainda estiver "pendente".
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: session } = await supabase
    .from("sessions")
    .select("id, status, platform, google_event_id, time, clients(name)")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!session || !session.google_event_id || session.platform !== "Google" || session.status !== "pendente") {
    return NextResponse.json({ status: session?.status ?? null });
  }

  try {
    const accessToken = await getValidGoogleAccessToken(user.id);
    if (!accessToken) {
      return NextResponse.json({ status: session.status });
    }

    const event = await getCalendarEvent(accessToken, session.google_event_id);
    const attendee = event.attendees?.find((a) => !a.self) ?? event.attendees?.[0];
    const responseStatus = attendee?.responseStatus;

    const newStatus =
      responseStatus === "accepted" ? "confirmada" : responseStatus === "declined" ? "cancelada" : null;

    if (!newStatus) {
      return NextResponse.json({ status: session.status });
    }

    await supabase.from("sessions").update({ status: newStatus }).eq("id", id);
    revalidatePath("/dashboard");

    const clientName = (session as unknown as { clients?: { name?: string } | null }).clients?.name ?? "cliente";
    await sendPushToOwner(user.id, {
      title: newStatus === "confirmada" ? "Sessão confirmada" : "Sessão recusada",
      body:
        newStatus === "confirmada"
          ? `${clientName} confirmou a sessão das ${session.time}.`
          : `${clientName} recusou a sessão das ${session.time}.`,
      url: "/dashboard",
    });

    return NextResponse.json({ status: newStatus });
  } catch (err) {
    console.error("[sync-status] Falha ao sincronizar status com o Google Calendar:", err);
    return NextResponse.json({ status: session.status });
  }
}
