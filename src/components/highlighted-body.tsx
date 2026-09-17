const VARIABLE_PATTERN = /(\{\{[a-zA-Z0-9_]+\}\})/g;

export function HighlightedBody({ body, className }: { body: string; className?: string }) {
  const parts = body.split(VARIABLE_PATTERN);

  return (
    <pre className={className}>
      {parts.map((part, i) =>
        // split() with a capturing group interleaves matches at odd indices
        i % 2 === 1 ? (
          <mark
            key={i}
            className="rounded bg-amber-100 px-1 py-0.5 font-semibold text-amber-800"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </pre>
  );
}
