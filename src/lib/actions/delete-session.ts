"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function deleteSessionAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const sessionId = String(formData.get("sessionId") || "");
  if (!sessionId) throw new Error("Sessão inválida");

  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId)
    .eq("owner_id", user.id);

  if (error) throw error;

  redirect("/dashboard");
}
