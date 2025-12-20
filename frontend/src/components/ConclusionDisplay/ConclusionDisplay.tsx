import type { Context } from "../../types/session";

interface ConclusionDisplayProps {
  conclusion: string | null;
  contexts?: Context[] | undefined;
  agentRole?: string;
  agent?: string;
}

function ConclusionDisplay({
  conclusion,
  contexts,
  agentRole,
  agent,
}: ConclusionDisplayProps): JSX.Element {
  if (!conclusion) {
    return (
      <div className="text-center text-muted-foreground p-md md:p-lg">
        Conclusion will appear here when debate is complete
      </div>
    );
  }

  return (
    <div className="bg-card p-md md:p-lg rounded-lg shadow-card">
      <div className="flex items-center gap-sm mb-md">
        <h2 className="text-lg md:text-xl font-bold text-foreground">Debate Conclusion</h2>
        {agentRole && agent && (
          <span className="text-xs text-muted-foreground">
            by {agentRole} ({agent})
          </span>
        )}
      </div>
      <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap mb-md">
        {conclusion}
      </div>
      {contexts && contexts.length > 0 && (
        <div className="mt-md pt-md border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-sm">Context</h3>
          <ol className="list-decimal list-inside space-y-xs text-sm text-muted-foreground">
            {contexts.map((context, idx) => (
              <li key={idx}>
                {context.url ? (
                  <a
                    href={context.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {context.title}
                  </a>
                ) : (
                  <span className="text-foreground">{context.title}</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default ConclusionDisplay;
