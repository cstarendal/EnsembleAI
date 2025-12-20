import { useCallback, useState, type ChangeEvent, type FormEvent } from "react";
import { createSession } from "../services/apiService";

export interface UseDebateTopicControllerParams {
  onSubmit?: (sessionId: string) => void;
}

export interface UseDebateTopicControllerResult {
  topic: string;
  error: string | null;
  isSubmitting: boolean;
  handleChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
}

function validateTopic(value: string): string | null {
  if (!value.trim()) {
    return "Topic is required";
  }
  if (value.length < 10) {
    return "Topic must be at least 10 characters";
  }
  if (value.length > 1000) {
    return "Topic must be at most 1000 characters";
  }
  return null;
}

export function useDebateTopicController(
  params: UseDebateTopicControllerParams
): UseDebateTopicControllerResult {
  const { onSubmit } = params;
  const [topic, setTopic] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>): void => {
    setTopic(e.target.value);
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      setError(null);

      const validationError = validateTopic(topic);
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsSubmitting(true);
      try {
        const { sessionId } = await createSession(topic.trim());
        onSubmit?.(sessionId);
        setTopic("");
      } catch {
        setError("Failed to start debate session");
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, topic]
  );

  return { topic, error, isSubmitting, handleChange, handleSubmit };
}
