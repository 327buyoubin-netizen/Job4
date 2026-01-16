import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface DraftPreviewProps {
  draft: string;
  question: string;
}

export function DraftPreview({ draft, question }: DraftPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card data-testid="draft-preview-card">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg">자소서 초안</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            data-testid="button-copy-draft"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                복사됨
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                복사
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">문항: {question}</p>
      </CardHeader>
      <CardContent>
        <div
          className="p-4 bg-muted/50 rounded-md text-sm leading-relaxed whitespace-pre-wrap"
          data-testid="text-draft-content"
        >
          {draft}
        </div>
      </CardContent>
    </Card>
  );
}
