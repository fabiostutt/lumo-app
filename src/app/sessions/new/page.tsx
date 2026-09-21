import ScheduleSessionForm from "@/components/ScheduleSessionForm";
import TitleAction from "@/components/TitleAction";
import { getClientsForOwner } from "@/lib/clients";
import { getOrCreateProfile } from "@/lib/plan";

export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const [clients, profile] = await Promise.all([getClientsForOwner(), getOrCreateProfile()]);

  return (
    <div className="flex w-full flex-col gap-[var(--slot-gap-base,24px)] bg-[var(--surface-base,white)] p-[var(--screen-padding,16px)]">
      <TitleAction title="Agendar sessão" href="/dashboard" />
      <ScheduleSessionForm
        clients={clients}
        initialClientId={clientId}
        initialDurationMinutes={profile.default_duration_minutes}
      />
    </div>
  );
}
