import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "~/lib/utils";
import { getAccentColor } from "~/lib/theme";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  theme?: string | null;
}

export function MarkdownRenderer({ content, className, theme }: MarkdownRendererProps) {
  const accentColor = getAccentColor(theme);

  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ children, href }) => (
            <a
              href={href}
              className={cn(accentColor, "underline underline-offset-2 hover:opacity-80")}
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className={cn(accentColor, "font-semibold")}>
              {children}
            </strong>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
