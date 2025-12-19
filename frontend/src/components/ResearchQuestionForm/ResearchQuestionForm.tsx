import { useState, FormEvent } from "react";

interface ResearchQuestionFormProps {
  onSubmit?: (sessionId: string) => void;
}

function ResearchQuestionForm({ onSubmit }: ResearchQuestionFormProps): JSX.Element {
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateQuestion = (value: string): string | null => {
    if (!value.trim()) {
      return "Question is required";
    }
    if (value.length < 10) {
      return "Question must be at least 10 characters";
    }
    if (value.length > 1000) {
      return "Question must be at most 1000 characters";
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);

    const validationError = validateQuestion(question);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!result.ok) {
        throw new Error("Failed to start research session");
      }

      const data = await result.json();
      if (onSubmit) {
        onSubmit(data.sessionId);
      }
      setQuestion("");
    } catch (err) {
      setError("Failed to start research session");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-md">
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-foreground mb-xs">
          Research Question
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            setError(null);
          }}
          rows={4}
          className="w-full p-md border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
        className="px-lg py-md bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Starting Research..." : "Start Research"}
      </button>
    </form>
  );
}

export default ResearchQuestionForm;
