import ReactMarkdown from "react-markdown";

type Props = {
  content: string | { type: string; text: string }[];
  chatPage?: boolean;
};

export const AIContentDisplay = ({ content, chatPage = false }: Props) => {
  const normalized = Array.isArray(content)
    ? content.map((c) => ("text" in c ? c.text : "")).join("\n")
    : content;

  function sanitizeMarkdown(c: string) {
    return c
      .replace(/^```(?:markdown)?\s*/i, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();
  }

  const safeContent = sanitizeMarkdown(normalized);

  if (chatPage) {
    return <ReactMarkdown>{safeContent}</ReactMarkdown>;
  }

  return (
    <ReactMarkdown
      components={{
        h1: ({ node, ...props }) => (
          <h1
            className="text-2xl font-bold tracking-tight text-foreground mt-8 mb-3 first:mt-0"
            {...props}
          />
        ),
        h2: ({ node, ...props }) => (
          <h2
            className="text-xl font-semibold tracking-tight text-foreground mt-8 mb-2.5"
            {...props}
          />
        ),
        h3: ({ node, ...props }) => (
          <h3
            className="text-base font-semibold text-foreground mt-5 mb-2"
            {...props}
          />
        ),
        h4: ({ node, ...props }) => (
          <h4
            className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mt-4 mb-1.5"
            {...props}
          />
        ),
        p: ({ node, ...props }) => (
          <p
            className="text-sm leading-7 text-foreground/90 mb-4 last:mb-0"
            {...props}
          />
        ),
        strong: ({ node, ...props }) => (
          <strong className="font-semibold text-foreground" {...props} />
        ),
        em: ({ node, ...props }) => (
          <em className="italic text-foreground/80" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul
            className="list-disc ml-5 mb-4 space-y-1.5 text-sm text-foreground/90"
            {...props}
          />
        ),
        ol: ({ node, ...props }) => (
          <ol
            className="list-decimal ml-5 mb-4 space-y-1.5 text-sm text-foreground/90"
            {...props}
          />
        ),
        li: ({ node, ...props }) => (
          <li className="leading-relaxed" {...props} />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-2 border-foreground/30 pl-4 my-4 italic text-muted-foreground text-sm"
            {...props}
          />
        ),
        hr: ({ node, ...props }) => (
          <hr className="mt-8 mb-6 border-border/60" {...props} />
        ),
        // @ts-ignore
        code: ({ node, inline, ...props }) =>
          inline ? (
            <code
              className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground"
              {...props}
            />
          ) : (
            <pre className="bg-muted rounded-lg p-4 my-4 overflow-x-auto text-xs">
              <code className="font-mono text-foreground" {...props} />
            </pre>
          ),
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border-collapse" {...props} />
          </div>
        ),
        th: ({ node, ...props }) => (
          <th
            className="border border-border px-3 py-2 text-left font-semibold text-xs uppercase tracking-wide bg-muted"
            {...props}
          />
        ),
        td: ({ node, ...props }) => (
          <td
            className="border border-border px-3 py-2 text-sm text-foreground/90"
            {...props}
          />
        ),
      }}
    >
      {safeContent}
    </ReactMarkdown>
  );
};
