# Lumo

Fresh Next.js (App Router, TypeScript, Tailwind v4) starter for Lumo, scaffolded
to plug in your existing Figma design system.

## What's already set up

- Next.js + TypeScript + Tailwind v4 (CSS-based theme config, not `tailwind.config.js`)
- Token structure in `src/app/globals.css` (`@theme` block) + placeholder JSON
  exports in `src/styles/tokens/` (`global.json`, `semantic.json`, `components.json`)
- `/tokens` preview page (`src/app/tokens/page.tsx`) to visually check colors,
  spacing, and type against Figma — same approach as the previous build
- Supabase client helpers: `src/lib/supabase/client.ts` (browser) and
  `src/lib/supabase/server.ts` (Server Components/Actions)
- PWA basics: `public/manifest.json`, wired into `src/app/layout.tsx`
  (add real `icons/icon-192.png` and `icons/icon-512.png` when ready)
- `.env.local.example` listing the Supabase, Google, and Stripe env vars you'll need

## Getting started in Cursor

1. Open this folder in Cursor.
2. `npm install`
3. Copy `.env.local.example` to `.env.local` and fill in your Supabase project
   URL/anon key (Supabase dashboard -> Settings -> API).
4. `npm run dev` -- visit `http://localhost:3000/tokens` to check the token preview.
5. Replace the placeholder values in `src/app/globals.css` and the JSON files
   in `src/styles/tokens/` with your real Lumo theme values from Figma.

## Suggested next steps

1. Paste in real token values, verify `/tokens` matches Figma
2. Create Supabase project, enable Google OAuth provider, wire up sign-in
3. Rebuild the Home screen (calendar/meeting list)
4. Rebuild the client form screen
5. Add Stripe once core flows work
6. PWA install prompt + service worker (for offline + "add to home screen")
