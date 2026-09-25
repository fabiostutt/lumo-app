const grayscale = Array.from({ length: 10 }, (_, i) => i + 1);
const spacingKeys = ["xxxs", "xxs", "xs", "sm", "md", "lg", "xl", "xxl", "xxxl"] as const;

export default function TokensPreviewPage() {
  return (
    <main className="p-8 space-y-12">
      <h1 className="text-2xl font-heading">Lumo — Token Preview</h1>

      <section>
        <h2 className="text-lg font-semibold mb-4">Root color scale (1–10)</h2>
        <div className="flex gap-2">
          {grayscale.map((n) => (
            <div key={n} className="text-center">
              <div
                className="w-16 h-16 rounded-md border border-black/10"
                style={{ background: `var(--color-root-${n})` }}
              />
              <span className="text-xs">{n}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Action colors</h2>
        <div className="flex gap-4">
          <div
            className="w-24 h-12 rounded-md flex items-center justify-center text-white text-sm"
            style={{ background: "var(--color-action-primary)" }}
          >
            Primary
          </div>
          <div
            className="w-24 h-12 rounded-md flex items-center justify-center text-white text-sm"
            style={{ background: "var(--color-action-secondary)" }}
          >
            Secondary
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Spacing (Numbers)</h2>
        <div className="flex items-end gap-3">
          {spacingKeys.map((key) => (
            <div key={key} className="text-center">
              <div
                className="bg-black/80"
                style={{ width: 24, height: `var(--space-${key})` }}
              />
              <span className="text-xs">{key}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Typography</h2>
        <div className="space-y-2">
          <p className="text-4xl font-heading">H1 — Lumo heading</p>
          <p className="text-2xl font-heading">H2 — Lumo heading</p>
          <p className="text-base font-sans">Body — Lumo paragraph text</p>
          <p className="text-sm font-sans">Small — Lumo helper text</p>
        </div>
      </section>
    </main>
  );
}
