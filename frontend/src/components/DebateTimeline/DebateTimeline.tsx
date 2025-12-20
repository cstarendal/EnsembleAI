import type { Session, DebateMessage, DebateRoundType } from "../../types/session";

interface DebateTimelineProps {
  session: Session | null;
}

const ROUND_LABELS: Record<DebateRoundType, string> = {
  opening: "Opening Statements",
  cross_exam: "Cross-Examination",
  rebuttal: "Rebuttal & Refinement",
  final: "Final Positions",
};

const ROUND_ORDER: DebateRoundType[] = ["opening", "cross_exam", "rebuttal", "final"];

function getPositionBadge(position?: string): JSX.Element | null {
  if (!position) return null;

  const colors: Record<string, string> = {
    for: "bg-success text-success-foreground",
    against: "bg-destructive text-destructive-foreground",
    neutral: "bg-muted text-muted-foreground",
    mixed: "bg-warning text-warning-foreground",
  };

  return (
    <span className={`text-xs px-xs py-xs rounded ${colors[position] || colors.neutral}`}>
      {position}
    </span>
  );
}

function DebateMessageCard({ message }: { message: DebateMessage }): JSX.Element {
  return (
    <div className="bg-background border border-border rounded-lg p-sm md:p-md">
      <div className="flex items-center justify-between gap-sm mb-xs">
        <div className="flex items-center gap-sm">
          <span className="font-medium text-foreground text-sm">{message.role}</span>
          <span className="text-xs text-muted-foreground">({message.agent})</span>
          {getPositionBadge(message.position)}
        </div>
        {message.target && message.target !== "all" && (
          <span className="text-xs text-muted-foreground">→ {message.target}</span>
        )}
      </div>

      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{message.content}</p>

      {message.keyPoints && message.keyPoints.length > 0 && (
        <div className="mt-sm">
          <p className="text-xs font-medium text-foreground mb-xs">Key Points:</p>
          <ul className="list-disc list-inside text-xs text-muted-foreground space-y-xs">
            {message.keyPoints.map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {message.revisions && (
        <div className="mt-sm pt-sm border-t border-border">
          <p className="text-xs text-info">
            <span className="font-medium">Changed:</span> {message.revisions}
          </p>
        </div>
      )}
    </div>
  );
}

function DebateRoundSection({
  round,
  messages,
}: {
  round: DebateRoundType;
  messages: DebateMessage[];
}): JSX.Element {
  return (
    <div className="space-y-sm">
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-sm">
        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
          {messages[0]?.roundNumber || "?"}
        </span>
        {ROUND_LABELS[round]}
      </h4>
      <div className="space-y-sm pl-md border-l-2 border-primary/20">
        {messages.map((msg) => (
          <DebateMessageCard key={msg.id} message={msg} />
        ))}
      </div>
    </div>
  );
}

function DebateTimeline({ session }: DebateTimelineProps): JSX.Element {
  if (!session) {
    return (
      <div className="text-center text-muted-foreground p-md md:p-lg">
        No active research session
      </div>
    );
  }

  // Group debate messages by round
  const debateByRound = ROUND_ORDER.reduce(
    (acc, round) => {
      acc[round] = session.debate?.filter((m) => m.round === round) || [];
      return acc;
    },
    {} as Record<DebateRoundType, DebateMessage[]>
  );

  const hasDebate = session.debate && session.debate.length > 0;

  return (
    <div className="space-y-md">
      {/* Status indicator */}
      <div className="flex items-center gap-md">
        <div
          className={`w-3 h-3 rounded-full ${
            session.status === "complete"
              ? "bg-success"
              : session.status === "error"
                ? "bg-destructive"
                : "bg-primary animate-pulse"
          }`}
        />
        <span className="text-sm font-medium text-foreground">Status: {session.status}</span>
      </div>

      {/* Research Plan */}
      {session.plan && (
        <div className="bg-card p-sm md:p-md rounded-lg shadow-card">
          <div className="flex items-center gap-sm mb-xs">
            <h3 className="text-sm font-semibold text-foreground">Research Plan</h3>
            {session.plan.agentRole && session.plan.agent && (
              <span className="text-xs text-muted-foreground">
                by {session.plan.agentRole} ({session.plan.agent})
              </span>
            )}
          </div>
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

      {/* Debate Section */}
      {hasDebate && (
        <div className="bg-card p-sm md:p-md rounded-lg shadow-card">
          <h3 className="text-base font-semibold text-foreground mb-md">
            Debate ({session.debate?.length} messages)
          </h3>
          <div className="space-y-lg">
            {ROUND_ORDER.map(
              (round) =>
                debateByRound[round].length > 0 && (
                  <DebateRoundSection key={round} round={round} messages={debateByRound[round]} />
                )
            )}
          </div>
        </div>
      )}

      {/* Agent Messages (non-debate) */}
      {session.messages.length > 0 && (
        <div className="bg-card p-sm md:p-md rounded-lg shadow-card">
          <h3 className="text-sm font-semibold text-foreground mb-sm">Agent Activity</h3>
          <div className="space-y-xs">
            {session.messages.map((msg, idx) => (
              <div key={idx} className="text-sm">
                <span className="font-medium text-foreground">{msg.role}</span>
                {msg.agent && (
                  <span className="text-xs text-muted-foreground ml-xs">({msg.agent})</span>
                )}
                <span className="text-muted-foreground">: {msg.content}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DebateTimeline;
