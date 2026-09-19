import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile } from "@/lib/plan";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

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

      if (user && providerRefreshToken) {
        // Garante que a linha de profile já existe (trial_ends_at é
        // obrigatório) antes de gravar os tokens do Google nela.
        await getOrCreateProfile();
        await supabase
          .from("profiles")
          .update({
            google_refresh_token: providerRefreshToken,
            google_access_token: providerAccessToken ?? null,
            google_token_expires_at: new Date(Date.now() + 55 * 60 * 1000).toISOString(),
          })
          .eq("id", user.id);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
