import type { ChangeEvent } from "react";
import { useDebateTopicController } from "../../hooks/useDebateTopicController";

interface DebateTopicFormProps {
  onSubmit?: (sessionId: string) => void;
}

function DebateTopicForm({ onSubmit }: DebateTopicFormProps): JSX.Element {
  const { topic, error, isSubmitting, handleChange, handleSubmit } = useDebateTopicController(
    onSubmit ? { onSubmit } : {}
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-md">
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-foreground mb-xs">
          Debate Topic
        </label>
        <textarea
          id="topic"
          value={topic}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleChange(e)}
          rows={4}
          className="w-full p-sm md:p-md border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Enter a topic to debate..."
          aria-label="Debate Topic"
          aria-invalid={error !== null}
          aria-describedby={error ? "topic-error" : undefined}
        />
        {error && (
          <p id="topic-error" className="mt-xs text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-md md:px-lg py-sm md:py-md bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Starting Debate..." : "Start Debate"}
      </button>
    </form>
  );
}

export default DebateTopicForm;
