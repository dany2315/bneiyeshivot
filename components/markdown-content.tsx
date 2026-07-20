import type { ReactNode } from "react";

type Block =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

function flushParagraph(blocks: Block[], paragraph: string[]) {
  const text = paragraph.join(" ").trim();
  if (text) {
    blocks.push({ type: "paragraph", text });
  }
  paragraph.length = 0;
}

function parseBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  const paragraph: string[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length > 0) {
      blocks.push({ type: "list", items: listItems });
      listItems = [];
    }
  }

  for (const rawLine of markdown.replace(/\r\n?/g, "\n").split("\n")) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph(blocks, paragraph);
      flushList();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph(blocks, paragraph);
      flushList();
      blocks.push({
        type: "heading",
        level: heading[1].length === 1 ? 2 : 3,
        text: heading[2].trim(),
      });
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      flushParagraph(blocks, paragraph);
      listItems.push(bullet[1].trim());
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph(blocks, paragraph);
  flushList();

  return blocks;
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(<strong key={nodes.length}>{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(<em key={nodes.length}>{token.slice(1, -1)}</em>);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export function MarkdownContent({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const blocks = parseBlocks(children);

  if (blocks.length === 0) return null;

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Tag = block.level === 2 ? "h2" : "h3";
          return (
            <Tag
              className="text-balance text-[var(--primary)]"
              key={`${block.type}-${index}`}
            >
              {renderInline(block.text)}
            </Tag>
          );
        }

        if (block.type === "list") {
          return (
            <ul
              className="list-disc space-y-2 pl-6 text-base leading-8 text-[var(--primary)]"
              key={`${block.type}-${index}`}
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        return (
          <p
            className="text-base leading-8 text-[var(--primary)]"
            key={`${block.type}-${index}`}
          >
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}
