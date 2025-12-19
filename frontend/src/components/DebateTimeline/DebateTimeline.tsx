import type { Session } from "../../types/session";

interface DebateTimelineProps {
  session: Session | null;
}

function DebateTimeline({ session }: DebateTimelineProps): JSX.Element {
  if (!session) {
    return <div className="text-center text-muted-foreground p-lg">No active research session</div>;
  }

  return (
    <div className="space-y-md">
      <div className="flex items-center gap-md">
        <div
          className={`w-3 h-3 rounded-full ${
            session.status === "complete"
              ? "bg-success"
              : session.status === "error"
                ? "bg-destructive"
                : "bg-primary"
          }`}
        />
        <span className="text-sm font-medium text-foreground">Status: {session.status}</span>
      </div>

      {session.plan && (
        <div className="bg-card p-md rounded-lg shadow-card">
          <h3 className="text-sm font-semibold text-foreground mb-xs">Research Plan</h3>
          <p className="text-sm text-muted-foreground">{session.plan.plan}</p>
          {session.plan.searchQueries.length > 0 && (
            <ul className="mt-sm list-disc list-inside text-sm text-muted-foreground">
              {session.plan.searchQueries.map((searchText, idx) => (
                <li key={idx}>{searchText}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {session.sources && session.sources.length > 0 && (
        <div className="bg-card p-md rounded-lg shadow-card">
          <h3 className="text-sm font-semibold text-foreground mb-sm">
            Sources Found ({session.sources.length})
          </h3>
          <div className="space-y-xs">
            {session.sources.map((source, idx) => (
              <div key={idx} className="text-sm">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {source.title}
                </a>
                <p className="text-muted-foreground text-xs mt-xs">{source.snippet}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {session.messages.length > 0 && (
        <div className="bg-card p-md rounded-lg shadow-card">
          <h3 className="text-sm font-semibold text-foreground mb-sm">Agent Messages</h3>
          <div className="space-y-xs">
            {session.messages.map((msg, idx) => (
              <div key={idx} className="text-sm">
                <span className="font-medium text-foreground">{msg.role}:</span>{" "}
                <span className="text-muted-foreground">{msg.content}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DebateTimeline;
