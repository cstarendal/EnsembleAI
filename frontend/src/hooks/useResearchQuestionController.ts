import { useCallback, useState, type ChangeEvent, type FormEvent } from "react";
import { createSession } from "../services/apiService";

export interface UseResearchQuestionControllerParams {
  onSubmit?: (sessionId: string) => void;
}

export interface UseResearchQuestionControllerResult {
  question: string;
  error: string | null;
  isSubmitting: boolean;
  handleChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
}

function validateQuestion(value: string): string | null {
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
}

export function useResearchQuestionController(
  params: UseResearchQuestionControllerParams
): UseResearchQuestionControllerResult {
  const { onSubmit } = params;
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>): void => {
    setQuestion(e.target.value);
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      setError(null);

      const validationError = validateQuestion(question);
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsSubmitting(true);
      try {
        const { sessionId } = await createSession(question.trim());
        onSubmit?.(sessionId);
        setQuestion("");
      } catch {
        setError("Failed to start research session");
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, question]
  );

  return { question, error, isSubmitting, handleChange, handleSubmit };
}
