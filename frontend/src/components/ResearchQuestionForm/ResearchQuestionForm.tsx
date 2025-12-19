import type { ChangeEvent } from "react";
import { useResearchQuestionController } from "../../hooks/useResearchQuestionController";

interface ResearchQuestionFormProps {
  onSubmit?: (sessionId: string) => void;
}

function ResearchQuestionForm({ onSubmit }: ResearchQuestionFormProps): JSX.Element {
  const { question, error, isSubmitting, handleChange, handleSubmit } = useResearchQuestionController(
    onSubmit ? { onSubmit } : {}
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-md">
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-foreground mb-xs">
          Research Question
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleChange(e)}
          rows={4}
          className="w-full p-sm md:p-md border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Enter your research question here..."
          aria-label="Research Question"
          aria-invalid={error !== null}
          aria-describedby={error ? "question-error" : undefined}
        />
        {error && (
          <p id="question-error" className="mt-xs text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-md md:px-lg py-sm md:py-md bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Starting Research..." : "Start Research"}
      </button>
    </form>
  );
}

export default ResearchQuestionForm;
