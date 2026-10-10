import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile, needsOnboarding } from "@/lib/plan";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const explicitNext = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // O Google só manda provider_refresh_token na primeira autorização de
      // um escopo (access_type=offline + prompt=consent) — se o usuário já
      // tinha logado antes sem o escopo do Calendar, ele reaparece aqui após
      // o novo consentimento. Guardamos para criar eventos em nome dele
      // depois, fora do contexto de uma sessão de login ativa.
      const providerRefreshToken = data.session?.provider_refresh_token;
      const providerAccessToken = data.session?.provider_token;
      const user = data.user;

      // Garante que a linha de profile já existe (trial_ends_at é
      // obrigatório) antes de gravar os tokens do Google nela, e também pra
      // poder checar se o onboarding ainda não foi concluído.
      const profile = user ? await getOrCreateProfile() : null;

      if (user && providerRefreshToken) {
        await supabase
          .from("profiles")
          .update({
            google_refresh_token: providerRefreshToken,
            google_access_token: providerAccessToken ?? null,
            google_token_expires_at: new Date(Date.now() + 55 * 60 * 1000).toISOString(),
          })
          .eq("id", user.id);
      }

      // Sem ?next explícito, manda pro onboarding se ele ainda não foi
      // concluído — senão segue pro dashboard como antes.
      const next = explicitNext ?? (profile && needsOnboarding(profile) ? "/onboarding" : "/dashboard");

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
