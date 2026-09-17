"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createClientAction(formData: FormData) {
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
    throw new Error("Nome é obrigatório");
  }

  const { error } = await supabase.from("clients").insert({
    owner_id: user.id,
    name,
    whatsapp: whatsapp || null,
    email: email || null,
    cpf: cpf || null,
    session_type: sessionType,
  });

  if (error) throw error;

  redirect("/dashboard");
}
