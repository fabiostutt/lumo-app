import Link from "next/link";
import ClientForm from "@/components/ClientForm";
import TitleAction from "@/components/TitleAction";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile, getEffectivePlan, FREE_CLIENT_LIMIT } from "@/lib/plan";

export default async function NewClientPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let blocked = false;

  if (user) {
    const profile = await getOrCreateProfile();
    const plan = getEffectivePlan(profile);

    if (plan === "free") {
      const { count } = await supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", user.id);

      blocked = (count ?? 0) >= FREE_CLIENT_LIMIT;
    }
  }

  return (
    <div className="flex w-full flex-col gap-[var(--slot-gap-base,24px)] bg-[var(--surface-base,white)] p-[var(--screen-padding,16px)]">
      <TitleAction title="Cadastrar cliente" href="/dashboard" />

      {blocked ? (
        <div className="flex w-full flex-col items-start gap-[var(--spacing-md,16px)] rounded-[var(--border-radius-lg,16px)] border-[length:var(--border-width-xxs,1px)] border-solid border-[var(--border-subtlest,#eee)] bg-[var(--surface-subtle,#fafafa)] p-[var(--spacing-padding-lg,16px)]">
          <p className="text-[16px] leading-[24px] tracking-[-0.2px] text-[color:var(--content-base,#212121)]">
            Você atingiu o limite de 5 clientes do plano Free. Assine o Pro para cadastrar mais clientes.
          </p>
          <Link
            href="/pricing"
            className="flex h-[48px] w-full items-center justify-center rounded-[var(--button-border-radius-medium,12px)] bg-[var(--button-primary-surface-enabled,#212121)] px-[var(--button-padding,16px)] text-[16px] font-semibold text-[color:var(--button-primary-content-enabled,#fafafa)]"
          >
            Ver planos
          </Link>
        </div>
      ) : (
        <ClientForm />
      )}
    </div>
  );
}
