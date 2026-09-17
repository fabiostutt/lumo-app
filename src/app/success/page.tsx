import Button from "@/components/ui/Button";
import Link from "next/link";

export default function SuccessPage() {
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
      <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8, color: "#212121" }}>
          Assinatura confirmada!
        </h1>
        <p style={{ fontSize: 16, color: "#757575", marginBottom: 40 }}>
          Bem-vindo ao Lumo Pro.
        </p>
        <Link href="/">
          <Button label="Ir para o app" variant="Primary" size="Large" fullWidth />
        </Link>
      </div>
    </main>
  );
}
