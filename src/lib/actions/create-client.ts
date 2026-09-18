"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getOrCreateProfile, getEffectivePlan, FREE_CLIENT_LIMIT } from "@/lib/plan";

export type CreateClientState = { error?: string } | null;

export async function createClientAction(
  _prevState: CreateClientState,
  formData: FormData
): Promise<CreateClientState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const name = String(formData.get("name") || "").trim();
  const whatsapp = String(formData.get("whatsapp") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const cpf = String(formData.get("cpf") || "").trim();
  const sessionType = String(formData.get("sessionType") || "online");

  if (!name) {
    return { error: "Nome é obrigatório" };
  }

  if (cpf) {
    const { data: existingCpf } = await supabase
      .from("clients")
      .select("id")
      .eq("owner_id", user.id)
      .eq("cpf", cpf)
      .maybeSingle();

    if (existingCpf) {
      return { error: "cpf_duplicate" };
    }
  }

  const profile = await getOrCreateProfile();
  const plan = getEffectivePlan(profile);

  if (plan === "free") {
    const { count } = await supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id);

    if ((count ?? 0) >= FREE_CLIENT_LIMIT) {
      return { error: "limit_reached" };
    }
  }

  const { error } = await supabase.from("clients").insert({
    owner_id: user.id,
    name,
    whatsapp: whatsapp || null,
    email: email || null,
    cpf: cpf || null,
    session_type: sessionType,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}
