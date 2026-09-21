# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start dev server (visit `http://localhost:3000/tokens` to check design tokens)
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + typescript)

There is no test suite configured in this repo.

Environment variables (copy `.env.local.example` to `.env.local`): Supabase URL/anon key, Google OAuth client id/secret (configured in Supabase Auth), Stripe publishable/secret keys + webhook secret, Web Push VAPID keys. Additional vars used in code but not in the example file: `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY`, `NEXT_PUBLIC_SITE_URL`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_TEMPLATE_NAME`, `WHATSAPP_TEMPLATE_LANG`.

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
- `src/lib/plan.ts` implements the free/pro plan gate: `getOrCreateProfile()` lazily inserts a `profiles` row with a 7-day trial (`TRIAL_DAYS`) on first access; `getEffectivePlan()` treats an active/trialing Stripe subscription or an unexpired trial as `"pro"`, otherwise `"free"`. `FREE_CLIENT_LIMIT` (5) is enforced in `createClientAction` before inserting a new client.

### Profile screen

`/profile` (`src/app/profile/page.tsx` + `src/components/ProfileScreen.tsx`) shows the practitioner's own info: name/email/avatar read straight from the Google-populated `user.user_metadata`/`user.email` (not stored locally, not editable here), plus editable fields that live on `profiles` (`whatsapp`, `professional_name`, `specialty`, `default_duration_minutes`, `default_session_type`) saved one at a time via `updateProfileFieldAction` (`src/lib/actions/update-profile.ts`) through small `BottomSheet`-based edit sheets. `default_duration_minutes` pre-fills the duration field when scheduling a new session (see below); `default_session_type` isn't consumed anywhere yet. The dashboard's gear quick-action button now routes here (label changed from "Configurações" to "Perfil") instead of `/pricing`; `/pricing` is still reachable from the free-plan-limit upsell links in `ClientForm.tsx`/`clients/new`.

### Session duration, conflict detection, and recurrence

`sessions.duration_minutes` is set explicitly per session at creation time (pre-filled from the profile's `default_duration_minutes`, editable) and never changes retroactively — this replaced a hardcoded 60-minute constant that `update-session.ts` used to compute the Google Calendar event's end time. `src/lib/scheduling.ts` is a plain (non-`"use server"`) module shared by the form and the Server Actions: `findConflicts()` checks a candidate `{date, time, durationMinutes}` against already-fetched session rows for overlapping time ranges on the same date, and both `createSessionAction`/`updateSessionAction` run it before writing anything, returning `{ error: formatConflictsMessage(...) }` (both actions now use the `useActionState`-style `(prevState, formData)` signature, wired through `ScheduleSessionForm`'s `state?.error` banner instead of throwing).

Recurrence (new sessions only, not available when editing) is a "repeat on these weekdays, every N weeks" model, not a full RRULE: `generateRecurrenceDates(startDate, weekdays, interval, maxOccurrences)` always includes the chosen start date, then scans forward day-by-day, keeping a date only if its weekday is selected **and** its week (Sunday-anchored) is a multiple of `interval` weeks away from the start date's week — this is what makes "every other Wednesday" (`interval=2`) work, not just "every Wednesday". Capped at `MAX_RECURRENCE_OCCURRENCES` (12) — there's no end-date picker by design (practitioners rarely know one upfront), so the cap is what actually stops the series. All occurrences share a `recurrence_group_id` and get their own row (materialized, not computed on read) so they behave like normal sessions everywhere else in the app (dashboard queries, conflict checks, delete/edit). Google Calendar events for a recurring series are created in parallel (`Promise.all`) to stay well under the serverless function timeout; the WhatsApp confirmation message is sent only for the first occurrence, not once per occurrence.

In `ScheduleSessionForm.tsx`, the "Semanal" preset needs `date` filled in first (it's disabled otherwise, since there's no weekday to derive without a reference date) — don't reintroduce a silent fallback to "today" there, it previously made the button appear to always select Sunday whenever someone clicked it before picking a date.

### Billing (Stripe)

`src/app/api/checkout/route.ts` creates a Stripe Checkout session for the authenticated user (`client_reference_id` = Supabase user id) and redirects to `/success` or `/pricing`.

`src/app/api/stripe/webhook/route.ts` handles `checkout.session.completed` / `customer.subscription.updated` / `customer.subscription.deleted` and writes subscription state onto the `profiles` table (matches `plan.ts`'s `Profile` type and is what `getEffectivePlan()` actually reads).

There used to be a second, older webhook route at `src/app/api/webhooks/stripe/route.ts` that wrote to a separate `subscriptions` table (keyed off `session.metadata.supabase_user_id` instead of `client_reference_id`). That table was never read anywhere in the app — `plan.ts` only ever queries `profiles` — so it was dead code left over from an earlier iteration (predating the `profiles`-based plan system) and has been removed. If a Stripe webhook URL was ever pointed at `/api/webhooks/stripe` in the Stripe dashboard, it needs to be repointed to `/api/stripe/webhook`.

### WhatsApp session confirmations

`src/lib/whatsapp.ts` sends a template message (via Meta Graph API) with inline Confirm/Cancel quick-reply buttons whose payloads encode `confirm_<sessionId>` / `cancel_<sessionId>`. `src/app/api/whatsapp/webhook/route.ts` handles Meta's `GET` verification handshake and the `POST` callback that parses the button payload and updates `sessions.status` accordingly (`"confirmada"` / `"cancelada"`), using the admin client since there's no user session in a webhook.

### Push notifications (Web Push)

`src/lib/push/server.ts` (`sendPushToOwner`) sends Web Push notifications via the `web-push` package, reading subscriptions for a given `owner_id` from the `push_subscriptions` table (admin client — called from webhook-style routes with no user session) and pruning subscriptions the browser has invalidated (push service returns 404/410). `src/lib/push/client.ts` has the browser-side counterpart: registers `public/sw.js`, requests `Notification` permission, subscribes via `PushManager`, and POSTs the subscription to `/api/push/subscribe` (which upserts it scoped to `auth.getUser()`). `src/components/PushNotificationsPrompt.tsx` is the opt-in UI shown on the dashboard when the browser isn't subscribed yet.

Two triggers call `sendPushToOwner`:
- `src/app/api/sessions/[id]/sync-status/route.ts` — when a pending session's Google Calendar RSVP flips to accepted/declined.
- `src/app/api/cron/session-reminders/route.ts` — checks sessions starting in the next 15 minutes and marks each one via `sessions.reminder_sent_at` so it never double-sends. It's meant to run every few minutes, but **Vercel's Hobby plan only runs cron jobs once a day** — `vercel.json`'s own cron entry is set to `0 12 * * *` purely as a harmless daily fallback that satisfies the Hobby plan limit. The real, frequent trigger is an external scheduler (this project uses cron-job.org) hitting `GET https://<domain>/api/cron/session-reminders` every 5 minutes with header `Authorization: Bearer $CRON_SECRET` — the route checks that header itself, so it doesn't matter what calls it. Move the cadence back into `vercel.json` and drop the external scheduler if the project ever upgrades to Vercel Pro.

### Design tokens

`src/app/globals.css` holds a Tailwind v4 `@theme` block (`--color-root-*` grayscale scale, `--color-action-*` semantic aliases, `--space-*` spacing scale) plus placeholder JSON mirrors in `src/styles/tokens/{global,semantic,components}.json`. These are scaffolding for a Figma design system that hasn't been pasted in yet — the `/tokens` page (`src/app/tokens/page.tsx`) is a visual reference to check new token values against Figma before wiring them into `globals.css`. Keep variable names stable when updating values so consuming components don't need to change.

### Layout shell

`src/app/layout.tsx` constrains the whole app to a `max-w-[430px]` centered column (mobile app shell look on desktop) and wraps all pages in `PageTransition` (`src/components/PageTransition.tsx`, framer-motion) for route-change animations.

## Project Rules

- **Sempre auditar os tokens reais do Figma via MCP antes de estilizar qualquer componente.** Nunca aproximar valores visualmente (cor, espaçamento, tipografia) "no olho" — puxe os tokens reais do arquivo Figma via MCP e use-os, mesmo que o placeholder em `globals.css`/`src/styles/tokens/` pareça já estar certo.
- **Nomes de CSS var trocam `/` por `-`.** Um token do Figma como `color/action/primary` vira `--color-action-primary`, nunca `--color/action/primary` — o Tailwind quebra ao usar `/` dentro de colchetes de valor arbitrário. Aplique essa conversão em qualquer novo token que for adicionado. (Evite escrever o padrão errado como `bg` + colchete + `var(--algo/com/barra)` + colchete literalmente neste arquivo — o scanner de conteúdo do Tailwind lê até este `.md` e tenta compilar qualquer coisa que pareça uma classe, o que já derrubou o `npm run dev` uma vez.)
- **Botões de perigo (danger) têm 3 variantes de component token no Figma — não confunda.** `Button/Danger Primary` (fundo `#fafafa`, sem borda, texto `#d71d1d` — `--button-danger-primary-*`) é o botão que abre a confirmação de exclusão ("Excluir sessão"/"Excluir cliente"). `Button/Danger Tertiary` (fundo `#d71d1d`, texto `#fafafa` — `--button-danger-tertiary-*`) é o botão sólido de confirmar exclusão dentro do bottom sheet. `Button/Danger Secondary` (branco, borda `#ee9e9e`, texto `#d71d1d` — `--button-danger-secondary-*`) existe no Figma mas não tem uso no código no momento.
- **Bottom sheets sempre usam o componente compartilhado `src/components/BottomSheet.tsx`.** Não crie um novo overlay/drawer do zero — componha sobre `BottomSheet` (como `ClientPickerSheet.tsx` e `MeetingDetailsSheet.tsx` já fazem).
- **Feedback rápido de ação (ex: "Link copiado") usa o componente compartilhado `src/components/Toast.tsx` + hook `useToast()` (`src/hooks/useToast.ts`).** Fixo na base da tela, centralizado, entra/sai por 300ms via `translate-y`/opacity, fica visível 3s (`useToast` cuida do timer). Não duplique esse padrão com `useState` local + `setTimeout` — chame `showToast("mensagem")` e renderize `<Toast show={show} message={message} />`.
- **Nunca `<form>` dentro de `<form>`.** HTML não permite formulários aninhados. Quando uma ação precisa ser disparada de dentro de outro `<form>` (ex: um botão de exclusão dentro do form de edição), chame a server action diretamente via `useTransition`/`startTransition` em vez de envolvê-la em um segundo `<form action={...}>`.
- **Sempre chamar `revalidatePath` depois de qualquer create/update/delete que afete o dashboard.** Toda Server Action em `src/lib/actions/` que altera `clients` ou `sessions` deve revalidar `/dashboard` (e qualquer outra rota que dependa dos dados alterados) antes de retornar/redirecionar — siga o padrão já usado em `create-session.ts` e `create-client.ts`.
- **~~Rota de webhook do Stripe duplicada~~ — resolvido.** Existiam duas rotas (`/api/stripe/webhook` escrevendo em `profiles`, `/api/webhooks/stripe` escrevendo em `subscriptions`). A tabela `subscriptions` nunca era lida em nenhum lugar do app (`plan.ts` só consulta `profiles`), então `/api/webhooks/stripe` era código morto de uma iteração anterior e foi removida. A rota oficial é `src/app/api/stripe/webhook/route.ts`. Se o dashboard da Stripe ainda aponta para `/api/webhooks/stripe`, o endpoint do webhook precisa ser atualizado lá para `/api/stripe/webhook`.
