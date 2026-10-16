// Util mínimo de analytics — não existe nenhum já no projeto. Loga via
// console.debug por enquanto; trocar por um provedor real (PostHog,
// Amplitude etc.) quando o projeto tiver um.
export function track(event: string, properties?: Record<string, unknown>) {
  console.debug(`[track] ${event}`, properties ?? {});
}
