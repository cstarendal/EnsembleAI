import DebateTopicForm from "../components/DebateTopicForm/DebateTopicForm";
import DebateTimeline from "../components/DebateTimeline/DebateTimeline";
import ConclusionDisplay from "../components/ConclusionDisplay/ConclusionDisplay";
import { useDebateSession } from "../hooks/useDebateSession";
import { useDebateStore } from "../stores/debateStore";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

function HomePage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const sessionId = useDebateStore((s) => s.sessionId);
  const setSessionId = useDebateStore((s) => s.setSessionId);
  const { session, isLoading } = useDebateSession(sessionId);

  useEffect(() => {
    const fromUrl = searchParams.get("sessionId");
    if (!fromUrl) return;
    if (fromUrl === sessionId) return;
    setSessionId(fromUrl);
  }, [searchParams, sessionId, setSessionId]);

  const handleSubmit = (newSessionId: string): void => {
    setSessionId(newSessionId);
  };

  return (
    <div className="container mx-auto p-md md:p-lg max-w-full md:max-w-2xl lg:max-w-4xl">
      <header className="mb-xl">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
          Ensemble AI Debate System
        </h1>
        <p className="text-muted-foreground mt-md">Multi-agent debate for exploring topics</p>
      </header>
      <main className="space-y-xl">
        <section className="bg-card p-md md:p-lg rounded-lg shadow-card">
          <h2 className="text-2xl font-semibold text-foreground mb-md">Start Debate</h2>
          <DebateTopicForm onSubmit={handleSubmit} />
        </section>

        {session && (
          <>
            <section className="bg-card p-md md:p-lg rounded-lg shadow-card">
              <h2 className="text-2xl font-semibold text-foreground mb-md">Debate Timeline</h2>
              <DebateTimeline session={session} />
              {isLoading && (
                <div className="mt-md text-sm text-muted-foreground">Processing debate...</div>
              )}
            </section>

            {session.conclusion && (
              <section>
                <ConclusionDisplay
                  conclusion={session.conclusion}
                  contexts={session.contexts}
                  agentRole={session.conclusionAgentRole}
                  agent={session.conclusionAgent}
                />
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default HomePage;
