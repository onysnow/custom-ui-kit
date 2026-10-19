import { Check, Copy } from "lucide-react";
import { Highlight, type PrismTheme } from "prism-react-renderer";
import { useState } from "react";
import { cn } from "@onysnow/utils";

// Colours come from the active theme's role tokens, so highlighted code always passes the theme's contrast checks.
const theme: PrismTheme = {
  plain: { color: "var(--text)", backgroundColor: "transparent" },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: { color: "var(--text-muted)", fontStyle: "italic" },
    },
    { types: ["punctuation", "operator"], style: { color: "var(--text-muted)" } },
    {
      types: ["keyword", "tag", "selector", "atrule", "boolean"],
      style: { color: "var(--accent-1)" },
    },
    {
      types: ["string", "attr-value", "template-string", "char"],
      style: { color: "var(--status-supported)" },
    },
    { types: ["number", "constant", "symbol"], style: { color: "var(--status-disputed)" } },
    { types: ["function", "class-name", "builtin"], style: { color: "var(--accent-2)" } },
    {
      types: ["attr-name", "property", "variable", "parameter"],
      style: { color: "var(--ai-mark)" },
    },
  ],
};

export function CodeBlock({
  code,
  lang = "tsx",
  title,
  className,
}: {
  code: string;
  lang?: string;
  title?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked: nothing to do */
    }
  };
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-[color-mix(in_oklab,var(--ground)_80%,black)]",
        className,
      )}
    >
      {title && (
        <div className="flex items-center justify-between border-b border-border px-4 py-2 font-mono text-xs text-muted-foreground">
          {title}
        </div>
      )}
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute right-2 top-2 z-10 grid size-8 place-items-center rounded-md border border-border bg-card/80 text-muted-foreground opacity-0 transition hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
        style={title ? { top: "2.6rem" } : undefined}
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
      <Highlight code={code.trimEnd()} language={lang} theme={theme}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className="overflow-x-auto p-4 font-mono text-[0.82rem] leading-relaxed">
            <code>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, k) => (
                    <span key={k} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
}
