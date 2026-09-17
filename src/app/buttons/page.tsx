import Button from "@/components/ui/Button";

const variants = ["Primary", "Secondary", "Tertiary", "Outline"] as const;
const sizes = ["Large", "Medium", "Small"] as const;
const tones = ["default", "Danger", "Destructive"] as const;

export default function ButtonsPage() {
  return (
    <main style={{ padding: 32, fontFamily: "Inter, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32 }}>Lumo - Buttons</h1>
      {tones.map((tone) => (
        <div key={tone} style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#757575" }}>
            Tone: {tone}
          </h2>
          {variants.map((variant) => (
            <div key={variant} style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 8 }}>{variant}</p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                {sizes.map((size) => (
                  <Button key={size} label={size} variant={variant} size={size} tone={tone} />
                ))}
                {sizes.map((size) => (
                  <Button
                    key={size + "-disabled"}
                    label={size}
                    variant={variant}
                    size={size}
                    tone={tone}
                    disabled
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </main>
  );
}
