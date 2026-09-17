import Dashboard from "@/components/Dashboard";
import { getDashboardData } from "@/lib/dashboard";

export default async function DashboardPage() {
  try {
    const data = await getDashboardData();
    return <Dashboard {...data} />;
  } catch (err) {
    return (
      <pre style={{ padding: 24, whiteSpace: "pre-wrap", color: "red" }}>
        {err instanceof Error ? err.message : JSON.stringify(err)}
      </pre>
    );
  }
}
