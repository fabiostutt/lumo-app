import { createClient } from "@/lib/supabase/server";

export async function getClientsForOwner() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("clients")
    .select("id, name, whatsapp")
    .eq("owner_id", user.id)
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
