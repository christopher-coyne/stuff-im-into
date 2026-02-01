import { useEffect, useState } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { cn } from "~/lib/utils";

interface MarkdownEditorProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  placeholder?: string;
  minHeight?: number;
  className?: string;
  maxLength?: number;
}

function EditorFallback({ minHeight }: { minHeight: number }) {
  return (
    <div
      className="bg-muted/50 animate-pulse flex items-center justify-center text-muted-foreground text-sm"
      style={{ height: minHeight }}
    >
      Loading editor...
    </div>
  );
}

// Inner component that imports the editor - only rendered on client
function MDEditorWrapper({
  value,
  onChange,
  placeholder,
  minHeight,
  colorMode,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight: number;
  colorMode: "light" | "dark";
}) {
  const [EditorModule, setEditorModule] = useState<{
    default: typeof import("@uiw/react-md-editor").default;
    commands: typeof import("@uiw/react-md-editor").commands;
  } | null>(null);

  useEffect(() => {
    import("@uiw/react-md-editor").then((mod) => {
      setEditorModule({ default: mod.default, commands: mod.commands });
    });
  }, []);

  if (!EditorModule) {
    return <EditorFallback minHeight={minHeight} />;
  }

  const { default: MDEditor, commands } = EditorModule;

  return (
    <div data-color-mode={colorMode}>
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || "")}
        preview="edit"
        height={minHeight}
        textareaProps={{ placeholder }}
        commands={[
          commands.bold,
          commands.italic,
          commands.strikethrough,
          commands.divider,
          commands.heading1,
          commands.heading2,
          commands.heading3,
          commands.divider,
          commands.link,
          commands.quote,
          commands.divider,
          commands.unorderedListCommand,
          commands.orderedListCommand,
        ]}
        extraCommands={[commands.fullscreen]}
      />
    </div>
  );
}

export function MarkdownEditor<T extends FieldValues>({
  name,
  control,
  placeholder,
  minHeight = 200,
  className,
  maxLength,
}: MarkdownEditorProps<T>) {
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Check initial dark mode state
    const isDark = document.documentElement.classList.contains("dark");
    setColorMode(isDark ? "dark" : "light");

    // Watch for changes to dark mode
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDark = document.documentElement.classList.contains("dark");
          setColorMode(isDark ? "dark" : "light");
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Don't render on server
  if (!isMounted) {
    return (
      <div
        className={cn("rounded-xl overflow-hidden border border-border", className)}
      >
        <EditorFallback minHeight={minHeight} />
      </div>
    );
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const currentLength = (value || "").length;
        const handleChange = (val: string) => {
          if (maxLength && val.length > maxLength) {
            onChange(val.slice(0, maxLength));
          } else {
            onChange(val);
          }
        };

        return (
          <div
            className={cn(
              "rounded-xl overflow-hidden border border-border",
              className
            )}
          >
            <MDEditorWrapper
              value={value || ""}
              onChange={handleChange}
              placeholder={placeholder}
              minHeight={minHeight}
              colorMode={colorMode}
            />
            {maxLength && (
              <p className="text-xs text-muted-foreground text-right px-3 py-1 border-t border-border">
                {currentLength} / {maxLength}
              </p>
            )}
            {error && (
              <p className="text-sm text-destructive mt-1 px-3 pb-2">
                {error.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
