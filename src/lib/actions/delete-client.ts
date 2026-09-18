"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function deleteClientAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const clientId = String(formData.get("clientId") || "");
  if (!clientId) throw new Error("Cliente inválido");

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId)
    .eq("owner_id", user.id);

  if (error) throw error;

  revalidatePath("/clients");
  redirect("/clients");
}
