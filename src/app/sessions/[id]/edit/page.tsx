import ScheduleSessionForm from "@/components/ScheduleSessionForm";
import TitleAction from "@/components/TitleAction";
import { getClientsForOwner } from "@/lib/clients";
import { getSessionById } from "@/lib/sessions";
import { notFound } from "next/navigation";

export default async function EditSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { id } = await params;
  const [{ clientId }, clients, session] = await Promise.all([
    searchParams,
    getClientsForOwner(),
    getSessionById(id),
  ]);

  if (!session) notFound();

  return (
    <div className="flex w-full flex-col gap-[var(--slot-gap-base,24px)] bg-[var(--surface-base,white)] p-[var(--screen-padding,16px)]">
      <TitleAction title="Editar sessão" href="/dashboard" />
      <ScheduleSessionForm
        clients={clients}
        sessionId={session.id}
        initialClientId={clientId ?? session.client_id ?? undefined}
        initialDate={session.date}
        initialTime={(session.time as string).slice(0, 5)}
        initialNotificationsOn={session.notifications_enabled ?? true}
        initialMeetingLink={session.meeting_link}
        initialPlatform={session.platform === "Google" ? "google" : "whatsapp"}
        initialDurationMinutes={session.duration_minutes ?? 50}
      />
    </div>
  );
}
