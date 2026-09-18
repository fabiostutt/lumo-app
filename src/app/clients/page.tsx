import ClientsListScreen from "@/components/ClientsListScreen";
import TitleAction from "@/components/TitleAction";
import { getClientsForOwner } from "@/lib/clients";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  const clients = await getClientsForOwner();

  return (
    <div className="flex w-full flex-col gap-[var(--slot-gap-base,24px)] bg-[var(--surface-base,white)] p-[var(--screen-padding,16px)]">
      <TitleAction title="Clientes" href={returnTo || "/dashboard"} />
      <ClientsListScreen clients={clients} returnTo={returnTo} />
    </div>
  );
}
