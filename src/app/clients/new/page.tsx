import ClientForm from "@/components/ClientForm";
import TitleAction from "@/components/TitleAction";

export default function NewClientPage() {
  return (
    <div className="flex w-full flex-col gap-[var(--slot-gap-base,24px)] bg-[var(--surface-base,white)] p-[var(--screen-padding,16px)]">
      <TitleAction title="Cadastrar cliente" href="/dashboard" />
      <ClientForm />
    </div>
  );
}
