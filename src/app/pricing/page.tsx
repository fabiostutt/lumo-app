"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function PricingPage() {
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);

  async function handleSubscribe(plan: "monthly" | "yearly") {
    setLoading(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(null);
      }
    } catch {
      setLoading(null);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        padding: 32,
      }}
    >
      <div style={{ width: "100%", maxWidth: 480, textAlign: "center" }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8, color: "#212121" }}>
          Lumo Pro
        </h1>
        <p style={{ fontSize: 16, color: "#757575", marginBottom: 40 }}>
          Escolha seu plano
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              border: "1px solid #EEEEEE",
              borderRadius: 16,
              padding: 24,
              textAlign: "left",
            }}
          >
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Mensal</p>
            <p style={{ fontSize: 14, color: "#757575", marginBottom: 20 }}>
              Cobrado todo mês
            </p>
            <Button
              label={loading === "monthly" ? "Carregando..." : "Assinar mensal"}
              variant="Primary"
              size="Large"
              fullWidth
              disabled={loading !== null}
              onClick={() => handleSubscribe("monthly")}
            />
          </div>

          <div
            style={{
              border: "1px solid #EEEEEE",
              borderRadius: 16,
              padding: 24,
              textAlign: "left",
            }}
          >
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Anual</p>
            <p style={{ fontSize: 14, color: "#757575", marginBottom: 20 }}>
              Cobrado uma vez por ano
            </p>
            <Button
              label={loading === "yearly" ? "Carregando..." : "Assinar anual"}
              variant="Outline"
              size="Large"
              fullWidth
              disabled={loading !== null}
              onClick={() => handleSubscribe("yearly")}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
