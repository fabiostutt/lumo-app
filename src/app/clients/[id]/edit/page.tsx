import ClientForm from "@/components/ClientForm";
import TitleAction from "@/components/TitleAction";
import { getClientById } from "@/lib/clients";
import { notFound } from "next/navigation";
import { getVocabularyForCurrentUser } from "@/lib/vocabulary-server";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) notFound();

  const vocab = await getVocabularyForCurrentUser();

  return (
    <div className="flex w-full flex-col gap-[var(--slot-gap-base,24px)] bg-[var(--surface-base,white)] p-[var(--screen-padding-base,16px)]">
      <TitleAction title={`Editar ${vocab.person(1)}`} href="/clients" />
      <ClientForm
        clientId={client.id}
        initialName={client.name}
        initialWhatsapp={client.whatsapp ?? ""}
        initialEmail={client.email ?? ""}
        initialCpf={client.cpf ?? ""}
      />
    </div>
  );
}
