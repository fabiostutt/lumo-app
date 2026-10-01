"use client";

import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// Glifo padrão da marca Apple (mesma silhueta usada nos botões "Sign in with
// Apple" pela indústria) — não conseguimos baixar o asset exato do Figma
// porque o acesso a www.figma.com está bloqueado pelo proxy de rede deste
// ambiente.
function AppleIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.207-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.68-3.43 2.71-1.517.03-2.02-.677-3.75-.677-1.734 0-2.294.65-3.743.71-1.44.05-2.53-1.45-3.47-2.78-1.94-2.75-3.43-7.75-1.44-11.14.98-1.68 2.75-2.75 4.66-2.78 1.46-.02 2.83.977 3.75.977.9 0 2.55-1.21 4.31-1.03.73.03 2.79.29 4.11 2.21-.11.07-2.45 1.42-2.42 4.25.03 3.38 2.98 4.51 3.02 4.53z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function LoginPage() {
  async function handleGoogleLogin() {
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
        scopes: "https://www.googleapis.com/auth/calendar.events",
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  }

  return (
    <div className="relative flex w-full flex-1 flex-col justify-end overflow-hidden bg-[var(--surface-strong,#757575)]">
      <div className="absolute inset-0 bg-[var(--overlay-base,#212121cc)] backdrop-blur-[4px]" />

      <div className="relative z-[2] flex flex-col gap-[var(--screen-gap,24px)] px-[var(--screen-padding-large,24px)] pt-[var(--spacing-xxl,40px)] pb-[var(--spacing-xxl,40px)] text-[color:var(--content-subtle,white)]">
        <div className="font-[family-name:var(--typography-heading-h1-font-family)] font-[var(--typography-heading-h1-font-weight,600)] text-[length:var(--typography-heading-h1-font-size,28px)] leading-[var(--typography-heading-h1-line-height,36px)] tracking-[var(--typography-heading-h1-letter-spacing,-0.4px)]">
          <p>Cuide dos clientes.</p>
          <p>O Lumo cuida da agenda.</p>
        </div>
        <p className="font-[family-name:var(--typography-body-medium-font-family)] font-[var(--typography-body-medium-font-weight,400)] text-[length:var(--typography-body-medium-font-size,16px)] leading-[var(--typography-body-medium-line-height,28px)] tracking-[var(--typography-body-medium-letter-spacing,-0.2px)]">
          Confirmações e lembretes automáticos por WhatsApp, clientes organizados e sua rotina de atendimentos em um só lugar.
        </p>
      </div>

      <div className="relative z-[2] mx-4 mb-[18px] flex flex-col overflow-hidden rounded-[var(--sheet-border-radius-base,32px)] bg-[var(--surface-base,white)]">
        <div className="flex flex-col gap-[var(--sheet-gap-base,16px)] p-[var(--sheet-padding-base,24px)]">
          <p className="text-center font-[family-name:var(--typography-heading-h4-font-family)] font-[var(--typography-heading-h4-font-weight,600)] text-[length:var(--typography-heading-h4-font-size,16px)] leading-[var(--typography-heading-h4-line-height,24px)] tracking-[var(--typography-heading-h4-letter-spacing,-0.1px)] text-[color:var(--content-base,#212121)]">
            Crie sua conta ou faça login
          </p>

          <div className="flex flex-col gap-[var(--components-stack-gap-vertical,8px)]">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex h-[56px] w-full items-center justify-center gap-[var(--spacing-sm,12px)] rounded-[var(--border-radius-xl,20px)] border border-solid border-[var(--border-subtle,#bdbdbd)] bg-[var(--surface-subtle,#fafafa)]"
            >
              <GoogleIcon />
              <span className="text-[16px] font-semibold leading-[24px] tracking-[-0.2px] text-[color:var(--content-base,#212121)]">
                Continuar com Google
              </span>
            </button>
            <button
              type="button"
              className="flex h-[56px] w-full items-center justify-center gap-[var(--spacing-sm,12px)] rounded-[var(--border-radius-xl,20px)] bg-[var(--surface-strongest,#212121)]"
            >
              <AppleIcon className="text-[color:var(--content-subtle,white)]" />
              <span className="text-[16px] font-semibold leading-[24px] tracking-[-0.2px] text-[color:var(--content-subtle,white)]">
                Continuar com Apple
              </span>
            </button>
          </div>

          <p className="text-center font-[family-name:var(--typography-body-x-small-font-family)] font-[var(--typography-body-x-small-font-weight,400)] text-[length:var(--typography-body-x-small-font-size,12px)] leading-[var(--typography-body-x-small-line-height,20px)] tracking-[var(--typography-body-x-small-letter-spacing,-0.2px)] text-[color:var(--content-strongest,#757575)]">
            Ao continuar, você concorda com os{" "}
            <span className="text-[color:var(--content-base,#212121)]">Termos de Uso</span> e a{" "}
            <span className="text-[color:var(--content-base,#212121)]">Política de Privacidade</span> do Lumo.
          </p>
        </div>
      </div>
    </div>
  );
}
