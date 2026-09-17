import { clsx } from "clsx";

type Tone = "default" | "accent" | "muted" | "warn";

const tones: Record<Tone, string> = {
  default: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  muted: "bg-muted text-muted-foreground",
  warn: "bg-amber-100 text-amber-700",
};

export function Badge({
  tone = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
