interface FormMessageProps {
  error?: string | null;
  success?: boolean;
}

export default function FormMessage({ error, success }: FormMessageProps) {
  if (!error && !success) return null;

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2.5 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-2.5 rounded-lg flex items-center gap-2">
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      Saved successfully
    </div>
  );
}
