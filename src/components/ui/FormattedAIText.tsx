import { Fragment } from "react";

function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g).filter(Boolean);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${keyPrefix}-${i}`} className="font-bold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={`${keyPrefix}-${i}`}>{part}</Fragment>
    )
  );
}

/** Renders the narrow markdown subset our AI prompts actually produce: "- " bullets and **bold** spans. No parser/dependency — plain text falls through untouched. */
export function FormattedAIText({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n");
  const blocks: { type: "bullets" | "text"; lines: string[] }[] = [];

  for (const line of lines) {
    const isBullet = /^[-*]\s+/.test(line.trim());
    const trimmed = isBullet ? line.trim().replace(/^[-*]\s+/, "") : line;
    const last = blocks[blocks.length - 1];
    if (isBullet && last?.type === "bullets") {
      last.lines.push(trimmed);
    } else if (isBullet) {
      blocks.push({ type: "bullets", lines: [trimmed] });
    } else if (trimmed.trim() === "") {
      continue;
    } else if (last?.type === "text") {
      last.lines.push(trimmed);
    } else {
      blocks.push({ type: "text", lines: [trimmed] });
    }
  }

  return (
    <div className={className}>
      {blocks.map((block, i) =>
        block.type === "bullets" ? (
          <ul key={i} className="list-disc pl-4 space-y-1 my-1.5">
            {block.lines.map((line, j) => (
              <li key={j}>{renderInline(line, `${i}-${j}`)}</li>
            ))}
          </ul>
        ) : (
          <p key={i} className="leading-relaxed">
            {block.lines.map((line, j) => (
              <Fragment key={j}>
                {j > 0 ? <br /> : null}
                {renderInline(line, `${i}-${j}`)}
              </Fragment>
            ))}
          </p>
        )
      )}
    </div>
  );
}
