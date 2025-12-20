import type { Source } from "../../types/session";

interface AnswerDisplayProps {
  answer: string | null;
  sources?: Source[] | undefined;
}

function AnswerDisplay({ answer, sources }: AnswerDisplayProps): JSX.Element {
  if (!answer) {
    return (
      <div className="text-center text-muted-foreground p-md md:p-lg">
        Answer will appear here when research is complete
      </div>
    );
  }

  // Extract citations from answer (look for [1], [2], etc. or URLs)
  const citationPattern = /\[(\d+)\]/g;
  const citations: number[] = [];
  let match: RegExpExecArray | null;
  while ((match = citationPattern.exec(answer)) !== null) {
    const num = parseInt(match[1] || "0", 10);
    if (!citations.includes(num)) {
      citations.push(num);
    }
  }

  return (
    <div className="bg-card p-md md:p-lg rounded-lg shadow-card">
      <h2 className="text-lg md:text-xl font-bold text-foreground mb-md">Research Answer</h2>
      <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap mb-md">
        {answer}
      </div>
      {sources && sources.length > 0 && (
        <div className="mt-md pt-md border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-sm">Citations</h3>
          <ol className="list-decimal list-inside space-y-xs text-sm text-muted-foreground">
            {sources.map((source, idx) => (
              <li key={idx}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {source.title}
                </a>
                {source.qualityRating && (
                  <span className="ml-xs text-xs">(Quality: {source.qualityRating}/5)</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default AnswerDisplay;
