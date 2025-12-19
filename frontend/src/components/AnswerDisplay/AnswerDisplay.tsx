interface AnswerDisplayProps {
  answer: string | null;
}

function AnswerDisplay({ answer }: AnswerDisplayProps): JSX.Element {
  if (!answer) {
    return (
      <div className="text-center text-muted-foreground p-md md:p-lg">
        Answer will appear here when research is complete
      </div>
    );
  }

  return (
    <div className="bg-card p-md md:p-lg rounded-lg shadow-card">
      <h2 className="text-lg md:text-xl font-bold text-foreground mb-md">Research Answer</h2>
      <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">{answer}</div>
    </div>
  );
}

export default AnswerDisplay;
