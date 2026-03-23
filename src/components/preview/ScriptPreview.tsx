import { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

interface ScriptPreviewProps {
  script: string;
}

export function ScriptPreview({ script }: ScriptPreviewProps) {
  const [expanded, setExpanded] = useState(false);

  // Highlight scene directions in brackets
  const renderScript = (text: string) => {
    const parts = text.split(/(\[.*?\])/g);
    return parts.map((part, i) =>
      part.startsWith("[") ? (
        <span key={i} className="text-primary/80 italic font-medium text-xs block my-1.5 pl-3 border-l-2 border-primary/30">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-semibold">Generated Script</h2>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div className="px-5 pb-5">
          <div className="max-h-64 overflow-y-auto pr-2 scrollbar-thin">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {renderScript(script)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
