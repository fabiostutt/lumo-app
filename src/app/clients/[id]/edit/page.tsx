import ClientForm from "@/components/ClientForm";
import TitleAction from "@/components/TitleAction";
import { getClientById } from "@/lib/clients";
import { notFound } from "next/navigation";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) notFound();

  return (
    <div className="flex w-full flex-col gap-[var(--slot-gap-base,24px)] bg-[var(--surface-base,white)] p-[var(--screen-padding,16px)]">
      <TitleAction title="Editar cliente" href="/clients" />
      <ClientForm
        clientId={client.id}
        initialName={client.name}
        initialWhatsapp={client.whatsapp ?? ""}
        initialEmail={client.email ?? ""}
        initialCpf={client.cpf ?? ""}
        initialSessionType={(client.session_type as "online" | "presencial") ?? "online"}
      />
    </div>
  );
}
