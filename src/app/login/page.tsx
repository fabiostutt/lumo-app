"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  async function handleGoogleLogin() {
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      },
    });
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400, padding: 32, textAlign: "center" }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8, color: "#212121" }}>
          Lumo
        </h1>
        <p style={{ fontSize: 16, color: "#757575", marginBottom: 40 }}>
          Entre na sua conta
        </p>
        <button
          onClick={handleGoogleLogin}
          style={{
            width: "100%",
            height: 56,
            borderRadius: 16,
            background: "#212121",
            color: "#FAFAFA",
            fontSize: 18,
            fontWeight: 600,
            fontFamily: "Inter, sans-serif",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43