"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type UpdateClientState = { error?: string } | null;

export async function updateClientAction(
  _prevState: UpdateClientState,
  formData: FormData
): Promise<UpdateClientState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const clientId = String(formData.get("clientId") || "");
  const name = String(formData.get("name") || "").trim();
  const whatsapp = String(formData.get("whatsapp") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const cpf = String(formData.get("cpf") || "").trim();
  const sessionType = String(formData.get("sessionType") || "online");

  if (!clientId || !name) {
    return { error: "Nome é obrigatório" };
  }

  if (cpf) {
    const { data: existingCpf } = await supabase
      .from("clients")
      .select("id")
      .eq("owner_id", user.id)
      .eq("cpf", cpf)
      .maybeSingle();

    if (existingCpf && existingCpf.id !== clientId) {
      return { error: "cpf_duplicate" };
    }
  }

  const { data, error } = await supabase
    .from("clients")
    .update({
      name,
      whatsapp: whatsapp || null,
      email: email || null,
      cpf: cpf || null,
      session_type: sessionType,
    })
    .eq("id", clientId)
    .eq("owner_id", user.id)
    .select("id");

  if (error) {
    return { error: error.message };
  }
  if (!data || data.length === 0) {
    return { error: "Cliente não encontrado" };
  }

  revalidatePath("/clients");
  redirect("/clients");
}
