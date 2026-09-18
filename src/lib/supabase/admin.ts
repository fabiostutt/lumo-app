import { createClient } from "@supabase/supabase-js";

// Cliente com privilégios de service_role — só usar em contextos sem
// sessão de usuário (ex: webhooks), nunca no browser.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
