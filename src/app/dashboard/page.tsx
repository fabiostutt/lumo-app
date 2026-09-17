import Dashboard from "@/components/Dashboard";
import { getDashboardData } from "@/lib/dashboard";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  let data;
  try {
    data = await getDashboardData();
  } catch {
    redirect("/login");
  }

  return <Dashboard {...data} />;
}
