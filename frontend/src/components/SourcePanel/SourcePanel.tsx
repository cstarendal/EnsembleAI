import type { Source } from "../../types/session";

interface SourcePanelProps {
  sources: Source[];
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
                {source.hunter && (
                  <span className="ml-sm text-xs text-muted-foreground">
                    (Hunter {source.hunter}
                    {source.hunterAgent && ` - ${source.hunterAgent}`})
                  </span>
                )}
              </div>
              {source.qualityRating && (
                <div className="flex items-center gap-xs">
                  <span className="text-xs text-muted-foreground">Quality:</span>
                  <div className="flex gap-xs">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <span
                        key={rating}
                        className={`text-sm ${
                          rating <= source.qualityRating! ? "text-warning" : "text-muted-foreground"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground ml-xs">
                    {source.qualityRating}/5
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-sm">{source.snippet}</p>
            {source.critique && (
              <div className="mt-sm pt-sm border-t border-border">
                <div className="flex items-center gap-xs mb-xs">
                  <p className="text-xs font-medium text-foreground">Critique:</p>
                  {source.criticAgent && (
                    <span className="text-xs text-muted-foreground">
                      (Source Critic - {source.criticAgent})
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{source.critique}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SourcePanel;
