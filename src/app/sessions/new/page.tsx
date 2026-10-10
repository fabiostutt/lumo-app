import ScheduleSessionForm from "@/components/ScheduleSessionForm";
import TitleAction from "@/components/TitleAction";
import { getClientsForOwner } from "@/lib/clients";
import { getOrCreateProfile } from "@/lib/plan";
import { getVocabulary } from "@/lib/vocabulary";

export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const [clients, profile] = await Promise.all([getClientsForOwner(), getOrCreateProfile()]);
  const vocab = getVocabulary(profile.area);

  return (
    <div className="flex w-full flex-col gap-[var(--slot-gap-base,24px)] bg-[var(--surface-base,white)] p-[var(--screen-padding-base,16px)]">
      <TitleAction title={`Agendar ${vocab.event(1)}`} href="/dashboard" />
      <ScheduleSessionForm
        clients={clients}
        initialClientId={clientId}
        initialDurationMinutes={profile.default_duration_minutes}
      />
    </div>
  );
}
