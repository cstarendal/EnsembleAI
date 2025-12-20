import type { Context } from "../../types/session";

interface SourcePanelProps {
  sources: Context[];
}

function SourcePanel({ sources }: SourcePanelProps): JSX.Element {
  if (sources.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-md md:p-lg">No sources found yet</div>
    );
  }

  return (
    <div className="space-y-md">
      <h3 className="text-lg md:text-xl font-semibold text-foreground">
        Sources Found ({sources.length})
      </h3>
      <div className="space-y-md">
        {sources.map((source, idx) => (
          <div
            key={idx}
            className="bg-card p-md md:p-lg rounded-lg shadow-card border border-border"
          >
            <div className="flex items-start justify-between gap-md mb-sm">
              <div className="flex-1">
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium text-base md:text-lg"
                  >
                    {source.title}
                  </a>
                ) : (
                  <span className="font-medium text-base md:text-lg text-foreground">
                    {source.title}
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-sm">{source.snippet}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SourcePanel;
