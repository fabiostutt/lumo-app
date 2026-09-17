"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, User, MoreVertical } from "lucide-react";

type ClientOption = { id: string; name: string; whatsapp: string | null };

export default function ClientsListScreen({
  clients,
  returnTo,
}: {
  clients: ClientOption[];
  returnTo?: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="flex w-full flex-col gap-[var(--slot-gap-base,24px)]">
      <div className="flex h-[48px] w-full items-center gap-[var(--input-gap-inner,8px)] rounded-[var(--input-border-radius,16px)] border-[length:var(--input-border-width,0.5px)] border-solid border-[var(--input-default-border-default,#bdbdbd)] bg-[var(--input-default-surface,#fafafa)] px-[var(--input-padding,16px)]">
        <Search size={24} strokeWidth={1.75} className="shrink-0 text-[color:var(--content-strongest,#757575)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar cliente"
          className="flex-1 bg-transparent text-[16px] leading-[28px] tracking-[-0.2px] text-[color:var(--content-base,#212121)] outline-none placeholder:text-[color:var(--input-default-content-placeholder,#757575)]"
        />
      </div>

      <div className="flex w-full flex-col gap-[var(--section-gap,4px)]">
        <p className="text-[14px] leading-[24px] tracking-[-0.2px] text-[color:var(--content-strongest,#757575)]">
          {filtered.length} {filtered.length === 1 ? "cliente cadastrado" : "clientes cadastrados"}
        </p>

        {filtered.map((client) => {
          const row = (
            <div className="flex h-[72px] w-full items-center gap-[var(--spacing-md,16px)] rounded-[20px] border-[length:var(--border-width-xxxs,0.5px)] border-solid border-[var(--border-subtlest,#eee)] bg-[var(--surface-base,white)] p-[var(--spacing-md,16px)]">
              <User size={24} strokeWidth={1.75} className="shrink-0 text-[color:var(--content-strongest,#757575)]" />
              <div className="flex flex-1 flex-col items-start overflow-hidden">
                <p className="w-full truncate text-[16px] font-semibold leading-[24px] text-[color:var(--content-base,#212121)]">
                  {client.name}
                </p>
                <p className="w-full truncate text-[14px] leading-[24px] text-[color:var(--content-strongest,#757575)]">
                  {client.whatsapp || "Sem WhatsApp cadastrado"}
                </p>
              </div>
              {!returnTo && (
                <button
                  type="button"
                  onClick={(e) => e.preventDefault()}
                  className="flex size-[40px] shrink-0 items-center justify-center rounded-[var(--border-radius-lg,16px)] border-[length:var(--border-width-xxs,1px)] border-solid border-[var(--border-subtlest,#eee)] bg-[var(--surface-subtle,#fafafa)]"
                  aria-label="Opções"
                >
                  <MoreVertical size={24} strokeWidth={1.75} />
                </button>
              )}
            </div>
          );

          return returnTo ? (
            <Link key={client.id} href={`${returnTo}?clientId=${client.id}`}>
              {row}
            </Link>
          ) : (
            <div key={client.id}>{row}</div>
          );
        })}

        {filtered.length === 0 && (
          <p className="w-full py-8 text-center text-[14px] text-[color:var(--content-strongest,#757575)]">
            Nenhum cliente encontrado.
          </p>
        )}
      </div>
    </div>
  );
}
