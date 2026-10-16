import { getOrCreateProfile } from "@/lib/plan";
import { isTrialActive } from "@/lib/billing";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const profile = await getOrCreateProfile();
    return NextResponse.json({
      trialActive: isTrialActive(profile.trial_ends_at),
      trialEndsAt: profile.trial_ends_at ?? null,
    });
  } catch (err) {
    console.error("Erro ao buscar status do trial:", err);
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
