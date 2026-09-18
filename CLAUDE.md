# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start dev server (visit `http://localhost:3000/tokens` to check design tokens)
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + typescript)

There is no test suite configured in this repo.

Environment variables (copy `.env.local.example` to `.env.local`): Supabase URL/anon key, Google OAuth client id/secret (configured in Supabase Auth), Stripe publishable/secret keys + webhook secret. Additional vars used in code but not in the example file: `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY`, `NEXT_PUBLIC_SITE_URL`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_TEMPLATE_NAME`, `WHATSAPP_TEMPLATE_LANG`.

## Architecture

Next.js App Router + TypeScript + Tailwind v4, backed by Supabase (Postgres + Auth), with Stripe billing and WhatsApp (Meta Graph API) session-confirmation messages. This is a session/appointment scheduler for a single practitioner and their clients (in Portuguese-language product copy — UI strings and many code comments are in Portuguese even though identifiers are English).

### Supabase client variants (`src/lib/supabase/`)

Three separate ways to talk to Supabase, chosen by execution context — use the right one:
- `client.ts` — browser client (`createBrowserClient`), for Client Components.
- `server.ts` — Server Component/Server Action client, built from `next/headers` cookies. Cookie writes are wrapped in try/catch because Server Components can't set cookies (the middleware handles session refresh instead).
- `admin.ts` — service-role client (`createAdminClient`), bypasses RLS. Only ever used server-side in contexts with no user session (webhooks). Never expose the service-role key to the browser.
- `middleware.ts` (`updateSession`) — refreshes the auth session cookie on every request; wired into the root `src/middleware.ts` matcher (excludes static assets).

### Data flow

- Reads go through small query modules in `src/lib/` (e.g. `dashboard.ts`, `sessions.ts`, `clients.ts`) that each create their own Supabase server client, fetch the current user via `auth.getUser()`, and scope every query by `owner_id = user.id`.
- Writes go through Server Actions in `src/lib/actions/` (`"use server"`), which validate `FormData`, re-check auth, and call `revalidatePath` + `redirect` on success. Some (`createClientAction`) use the `useFormState`-style `(prevState, formData)` signature to return `{ error }` to the calling form instead of throwing.
- `src/lib/plan.ts` implements the free/pro plan gate: `getOrCreateProfile()` lazily inserts a `profiles` row with a 14-day trial (`TRIAL_DAYS`) on first access; `getEffectivePlan()` treats an active/trialing Stripe subscription or an unexpired trial as `"pro"`, otherwise `"free"`. `FREE_CLIENT_LIMIT` (5) is enforced in `createClientAction` before inserting a new client.

### Billing (Stripe)

`src/app/api/checkout/route.ts` creates a Stripe Checkout session for the authenticated user (`client_reference_id` = Supabase user id) and redirects to `/success` or `/pricing`.

There are currently **two** Stripe webhook route handlers with diverging logic:
- `src/app/api/stripe/webhook/route.ts` — writes subscription state onto the `profiles` table (matches `plan.ts`'s `Profile` type).
- `src/app/api/webhooks/stripe/route.ts` — writes to a separate `subscriptions` table and looks up the user via `session.metadata.supabase_user_id` instead of `client_reference_id`.

Only one of these matches whatever webhook URL is actually configured in the Stripe dashboard — check which is live before assuming either is dead code, and be careful not to silently fix "bugs" in the other one that's actually unused. **TODO:** this needs to be investigated and the unused route deleted (see Project Rules below).

### WhatsApp session confirmations

`src/lib/whatsapp.ts` sends a template message (via Meta Graph API) with inline Confirm/Cancel quick-reply buttons whose payloads encode `confirm_<sessionId>` / `cancel_<sessionId>`. `src/app/api/whatsapp/webhook/route.ts` handles Meta's `GET` verification handshake and the `POST` callback that parses the button payload and updates `sessions.status` accordingly (`"confirmada"` / `"cancelada"`), using the admin client since there's no user session in a webhook.

### Design tokens

`src/app/globals.css` holds a Tailwind v4 `@theme` block (`--color-root-*` grayscale scale, `--color-action-*` semantic aliases, `--space-*` spacing scale) plus placeholder JSON mirrors in `src/styles/tokens/{global,semantic,components}.json`. These are scaffolding for a Figma design system that hasn't been pasted in yet — the `/tokens` page (`src/app/tokens/page.tsx`) is a visual reference to check new token values against Figma before wiring them into `globals.css`. Keep variable names stable when updating values so consuming components don't need to change.

### Layout shell

`src/app/layout.tsx` constrains the whole app to a `max-w-[430px]` centered column (mobile app shell look on desktop) and wraps all pages in `PageTransition` (`src/components/PageTransition.tsx`, framer-motion) for route-change animations.

## Project Rules

- **Sempre auditar os tokens reais do Figma via MCP antes de estilizar qualquer componente.** Nunca aproximar valores visualmente (cor, espaçamento, tipografia) "no olho" — puxe os tokens reais do arquivo Figma via MCP e use-os, mesmo que o placeholder em `globals.css`/`src/styles/tokens/` pareça já estar certo.
- **Nomes de CSS var trocam `/` por `-`.** Um token do Figma como `color/action/primary` vira `--color-action-primary`, nunca `--color/action/primary` — o Tailwind quebra ao usar `/` dentro de colchetes (ex: `bg-[var(--color/action/primary)]`). Aplique essa conversão em qualquer novo token que for adicionado.
- **Bottom sheets sempre usam o componente compartilhado `src/components/BottomSheet.tsx`.** Não crie um novo overlay/drawer do zero — componha sobre `BottomSheet` (como `ClientPickerSheet.tsx` e `MeetingDetailsSheet.tsx` já fazem).
- **Nunca `<form>` dentro de `<form>`.** HTML não permite formulários aninhados. Quando uma ação precisa ser disparada de dentro de outro `<form>` (ex: um botão de exclusão dentro do form de edição), chame a server action diretamente via `useTransition`/`startTransition` em vez de envolvê-la em um segundo `<form action={...}>`.
- **Sempre chamar `revalidatePath` depois de qualquer create/update/delete que afete o dashboard.** Toda Server Action em `src/lib/actions/` que altera `clients` ou `sessions` deve revalidar `/dashboard` (e qualquer outra rota que dependa dos dados alterados) antes de retornar/redirecionar — siga o padrão já usado em `create-session.ts` e `create-client.ts`.
- **Rota de webhook do Stripe duplicada precisa de investigação.** `src/app/api/stripe/webhook/route.ts` e `src/app/api/webhooks/stripe/route.ts` implementam lógicas divergentes (uma escreve em `profiles`, a outra em `subscriptions`). Antes de mexer em qualquer lógica de billing, descubra qual rota está configurada no dashboard da Stripe como ativa e remova a outra — não assuma que uma delas é código morto sem confirmar.
