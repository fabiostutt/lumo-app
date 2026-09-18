import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TitleAction({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center gap-[var(--spacing-xs,8px)]">
      <Link
        href={href}
        className="flex size-[48px] shrink-0 items-center justify-center rounded-[var(--border-radius-lg,16px)] border-[length:var(--border-width-xxs,1px)] border-solid border-[var(--border-subtlest,#eee)] bg-[var(--surface-subtle,#fafafa)]"
        aria-label="Voltar"
      >
        <ArrowLeft size={24} strokeWidth={1.75} />
      </Link>
      <p className="whitespace-nowrap font-[family-name:var(--typography-heading-h3-font-family)] font-[var(--typography-heading-h3-font-weight,600)] text-[length:var(--typography-heading-h3-font-size,20px)] leading-[var(--typography-heading-h3-line-height,28px)] tracking-[var(--typography-heading-h3-letter-spacing,-0.2px)] text-[color:var(--content-base,#212121)]">
        {title}
      </p>
    </div>
  );
}
