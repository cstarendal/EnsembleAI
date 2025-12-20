import type {
  Session,
  DebateMessage,
  DebateRoundType,
  SessionParticipant,
} from "../../types/session";

interface DebateTimelineProps {
  session: Session | null;
}

const ROUND_LABELS: Record<DebateRoundType, string> = {
  pitch: "Round 1: The Pitch",
  cross_fire: "Round 2: Cross-Fire (Wildcard)",
  stress_test: "Round 3: Stress Test",
  steel_man: "Round 4: Steel Man",
  consensus: "Round 5: Consensus & Verdict",
};

const ROUND_ORDER: DebateRoundType[] = [
  "pitch",
  "cross_fire",
  "stress_test",
  "steel_man",
  "consensus",
];

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
          {message.confidenceScore !== undefined && (
            <span
              className={`text-xs px-xs py-xs rounded ${
                message.confidenceScore > 70
                  ? "bg-success/20 text-success"
                  : message.confidenceScore < 40
                    ? "bg-destructive/20 text-destructive"
                    : "bg-warning/20 text-warning"
              }`}
            >
              Conf: {message.confidenceScore}%
            </span>
          )}
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

function StatusIndicator({ status }: { status: string }): JSX.Element {
  const statusColor =
    status === "complete"
      ? "bg-success"
      : status === "error"
        ? "bg-destructive"
        : "bg-primary animate-pulse";

  return (
    <div className="flex items-center gap-md">
      <div className={`w-3 h-3 rounded-full ${statusColor}`} />
      <span className="text-sm font-medium text-foreground">Status: {status}</span>
    </div>
  );
}

function ParticipantsSection({
  participants,
}: {
  participants: SessionParticipant[];
}): JSX.Element {
  if (participants.length === 0) return <></>;

  return (
    <div className="bg-card p-sm md:p-md rounded-lg shadow-card">
      <h3 className="text-sm font-semibold text-foreground mb-sm">
        Participants ({participants.length})
      </h3>
      <div className="space-y-xs">
        {participants.map((p) => (
          <div
            key={p.personaId}
            className="flex items-start justify-between gap-sm border border-border rounded-md p-sm bg-background"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-sm">
                <span className="font-medium text-foreground text-sm">{p.role}</span>
                {p.isWildcard && (
                  <span className="text-xs px-xs py-xs rounded bg-warning/20 text-warning">
                    Wildcard
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{p.agent}</p>
              <p className="text-xs text-muted-foreground mt-xs">{p.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InitialContextSection({
  context,
}: {
  context: { context?: string; agentRole?: string; agent?: string };
}): JSX.Element {
  if (!context.context) return <></>;

  return (
    <div className="bg-card p-sm md:p-md rounded-lg shadow-card">
      <div className="flex items-center gap-sm mb-xs">
        <h3 className="text-sm font-semibold text-foreground">Initial Context</h3>
        {context.agentRole && context.agent && (
          <span className="text-xs text-muted-foreground">
            by {context.agentRole} ({context.agent})
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{context.context}</p>
    </div>
  );
}

function ContextsSection({
  contexts,
}: {
  contexts: Array<{ title: string; url?: string; snippet: string }>;
}): JSX.Element {
  if (contexts.length === 0) return <></>;

  return (
    <div className="bg-card p-sm md:p-md rounded-lg shadow-card">
      <h3 className="text-sm font-semibold text-foreground mb-sm">Context ({contexts.length})</h3>
      <div className="space-y-xs">
        {contexts.map((context, idx) => (
          <div key={idx} className="text-sm">
            <span className="font-medium text-foreground">{context.title}</span>
            {context.url && (
              <a
                href={context.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-xs text-xs"
              >
                ({context.url})
              </a>
            )}
            <p className="text-xs text-muted-foreground mt-xs">{context.snippet}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentActivitySection({
  messages,
}: {
  messages: Array<{ role: string; agent?: string; content: string }>;
}): JSX.Element {
  if (messages.length === 0) return <></>;

  return (
    <div className="bg-card p-sm md:p-md rounded-lg shadow-card">
      <h3 className="text-sm font-semibold text-foreground mb-sm">Agent Activity</h3>
      <div className="space-y-xs">
        {messages.map((msg, idx) => (
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
  );
}

function DebateTimeline({ session }: DebateTimelineProps): JSX.Element {
  if (!session) {
    return (
      <div className="text-center text-muted-foreground p-md md:p-lg">No active debate session</div>
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
      <StatusIndicator status={session.status} />
      {session.participants && <ParticipantsSection participants={session.participants} />}
      {session.context && <InitialContextSection context={session.context} />}
      {session.contexts && <ContextsSection contexts={session.contexts} />}
      {hasDebate && (
        <div className="bg-card p-sm md:p-md rounded-lg shadow-card">
          <h3 className="text-base font-semibold text-foreground mb-md">
            Debate Arena ({session.debate?.length} messages)
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
      <AgentActivitySection messages={session.messages} />
    </div>
  );
}

export default DebateTimeline;
