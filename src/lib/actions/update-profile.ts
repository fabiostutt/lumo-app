"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const EDITABLE_FIELDS = [
  "whatsapp",
  "professional_name",
  "specialty",
  "default_duration_minutes",
  "default_session_type",
] as const;

type EditableField = (typeof EDITABLE_FIELDS)[number];

export type UpdateProfileState = { error?: string } | null;

export async function updateProfileFieldAction(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const field = String(formData.get("field") || "");
  if (!EDITABLE_FIELDS.includes(field as EditableField)) {
    return { error: "Campo inválido" };
  }

  const rawValue = String(formData.get("value") || "").trim();
  const value: string | number =
    field === "default_duration_minutes" ? Number(rawValue) : rawValue;

  if (field === "default_duration_minutes" && (!Number.isFinite(value) || (value as number) <= 0)) {
    return { error: "Duração inválida" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ [field]: value || null })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return null;
}
