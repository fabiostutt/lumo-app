// Markdown mínimo pra páginas de texto estático (privacidade/termos): só o
// suficiente pra interpretar "# "/"## ", parágrafos, listas "- " e **negrito**
// — não é um parser de markdown genérico, e não precisa ser.
function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${keyPrefix}-${i}`} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={`${keyPrefix}-${i}`}>{part}</span>
    )
  );
}

export default function MarkdownContent({ text }: { text: string }) {
  const lines = text.trim().split("\n");
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="flex list-disc flex-col gap-[var(--spacing-xs,8px)] pl-[20px]">
        {listItems.map((item, i) => (
          <li
            key={i}
            className="font-[family-name:var(--typography-body-medium-font-family)] font-[var(--typography-body-medium-font-weight,400)] text-[length:var(--typography-body-medium-font-size,16px)] leading-[var(--typography-body-medium-line-height,28px)] tracking-[var(--typography-body-medium-letter-spacing,-0.2px)] text-[color:var(--content-base,#212121)]"
          >
            {renderInline(item, `li-${blocks.length}-${i}`)}
          </li>
        ))}
      </ul>
    );
    listItems = [];
  }

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (line === "") {
      flushList();
      return;
    }

    if (line.startsWith("## ")) {
      flushList();
      blocks.push(
        <h2
          key={`h2-${idx}`}
          className="font-[family-name:var(--typography-heading-h3-font-family)] font-[var(--typography-heading-h3-font-weight,600)] text-[length:var(--typography-heading-h3-font-size,20px)] leading-[var(--typography-heading-h3-line-height,28px)] tracking-[var(--typography-heading-h3-letter-spacing,-0.2px)] text-[color:var(--content-base,#212121)]"
        >
          {line.slice(3)}
        </h2>
      );
      return;
    }

    if (line.startsWith("# ")) {
      flushList();
      blocks.push(
        <h1
          key={`h1-${idx}`}
          className="font-[family-name:var(--typography-heading-h1-font-family)] font-[var(--typography-heading-h1-font-weight,600)] text-[length:var(--typography-heading-h1-font-size,28px)] leading-[var(--typography-heading-h1-line-height,36px)] tracking-[var(--typography-heading-h1-letter-spacing,-0.4px)] text-[color:var(--content-base,#212121)]"
        >
          {line.slice(2)}
        </h1>
      );
      return;
    }

    if (line.startsWith("- ")) {
      listItems.push(line.slice(2));
      return;
    }

    flushList();
    blocks.push(
      <p
        key={`p-${idx}`}
        className="font-[family-name:var(--typography-body-medium-font-family)] font-[var(--typography-body-medium-font-weight,400)] text-[length:var(--typography-body-medium-font-size,16px)] leading-[var(--typography-body-medium-line-height,28px)] tracking-[var(--typography-body-medium-letter-spacing,-0.2px)] text-[color:var(--content-base,#212121)]"
      >
        {renderInline(line, `p-${idx}`)}
      </p>
    );
  });
  flushList();

  return <div className="flex w-full flex-col gap-[var(--spacing-md,16px)]">{blocks}</div>;
}
