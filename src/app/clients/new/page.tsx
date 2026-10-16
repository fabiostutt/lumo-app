import ClientFormWithGate from "@/components/ClientFormWithGate";
import TitleAction from "@/components/TitleAction";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile, getGateState, FREE_CLIENT_LIMIT } from "@/lib/plan";
import { getVocabularyForCurrentUser } from "@/lib/vocabulary-server";

export default async function NewClientPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let blocked = false;
  let count = 0;

  if (user) {
    const profile = await getOrCreateProfile();

    if (getGateState(profile) === "free") {
      const { count: clientCount } = await supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", user.id);

      count = clientCount ?? 0;
      blocked = count >= FREE_CLIENT_LIMIT;
    }
  }

  const vocab = await getVocabularyForCurrentUser();

  return (
    <div className="flex w-full flex-col gap-[var(--slot-gap-base,24px)] bg-[var(--surface-base,white)] p-[var(--screen-padding-base,16px)]">
      <TitleAction title={`Cadastrar ${vocab.person(1)}`} href={returnTo || "/dashboard"} />

      <ClientFormWithGate returnTo={returnTo} openOnMount={blocked} clientCount={count} />
    </div>
  );
}
