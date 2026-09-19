import { createClient } from "@/lib/supabase/server";

export async function getClientsForOwner() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("clients")
    .select("id, name, whatsapp, email")
    .eq("owner_id", user.id)
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getClientById(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("clients")
    .select("id, name, whatsapp, email, cpf, session_type")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (error || !data) return null;
  return data;
}
