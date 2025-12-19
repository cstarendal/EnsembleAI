import { useState } from "react";
import ResearchQuestionForm from "../components/ResearchQuestionForm/ResearchQuestionForm";
import DebateTimeline from "../components/DebateTimeline/DebateTimeline";
import AnswerDisplay from "../components/AnswerDisplay/AnswerDisplay";
import { useResearchSession } from "../hooks/useResearchSession";

function HomePage(): JSX.Element {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { session, isLoading } = useResearchSession(sessionId);

  const handleSubmit = (newSessionId: string): void => {
    setSessionId(newSessionId);
  };

  return (
    <div className="container mx-auto p-lg max-w-4xl">
      <header className="mb-xl">
        <h1 className="text-4xl font-bold text-foreground">Ensemble AI Research System</h1>
        <p className="text-muted-foreground mt-md">Multi-agent debate for research questions</p>
      </header>
      <main className="space-y-xl">
        <section className="bg-card p-lg rounded-lg shadow-card">
          <h2 className="text-2xl font-semibold text-foreground mb-md">Start Research</h2>
          <ResearchQuestionForm onSubmit={handleSubmit} />
        </section>

        {session && (
          <>
            <section className="bg-card p-lg rounded-lg shadow-card">
              <h2 className="text-2xl font-semibold text-foreground mb-md">Research Timeline</h2>
              <DebateTimeline session={session} />
              {isLoading && (
                <div className="mt-md text-sm text-muted-foreground">Processing research...</div>
              )}
            </section>

            {session.answer && (
              <section>
                <AnswerDisplay answer={session.answer} />
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default HomePage;
