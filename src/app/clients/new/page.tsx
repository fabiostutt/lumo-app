import ClientForm from "@/components/ClientForm";
import ClientLimitModal from "@/components/ClientLimitModal";
import TitleAction from "@/components/TitleAction";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile, hasActiveSubscription, FREE_CLIENT_LIMIT } from "@/lib/plan";

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

  if (user) {
    const profile = await getOrCreateProfile();

    // O trial local não isenta do limite — só assinatura Stripe ativa/trialing.
    if (!hasActiveSubscription(profile)) {
      const { count } = await supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", user.id);

      blocked = (count ?? 0) >= FREE_CLIENT_LIMIT;
    }
  }

  return (
    <div className="flex w-full flex-col gap-[var(--slot-gap-base,24px)] bg-[var(--surface-base,white)] p-[var(--screen-padding,16px)]">
      <TitleAction title="Cadastrar cliente" href={returnTo || "/dashboard"} />

      {blocked ? <ClientLimitModal returnTo={returnTo} /> : <ClientForm returnTo={returnTo} />}
    </div>
  );
}
