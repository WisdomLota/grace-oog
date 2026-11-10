/** Small shared building blocks for the operator panel. */
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Card({ title, right, children, className }: { title: string; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-op border border-op-border bg-op-surface p-4 shadow-sm ${className ?? ""}`}>
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-op-muted">{title}</h2>
        {right}
      </header>
      {children}
    </section>
  );
}

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-op-accent text-op-accent-text hover:opacity-90",
  secondary: "border border-op-border bg-op-surface text-op-text hover:bg-op-bg",
  danger: "bg-op-danger text-white hover:opacity-90",
  ghost: "text-op-muted hover:bg-op-bg hover:text-op-text",
};

export function Button({ variant = "secondary", className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      {...rest}
      className={`rounded-op px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className ?? ""}`}
    />
  );
}

/** A coloured dot + label, e.g. "● Output connected". */
export function StatusPill({ ok, label, title }: { ok: boolean | null; label: string; title?: string }) {
  const color = ok === null ? "bg-op-muted" : ok ? "bg-op-live" : "bg-op-warn";
  return (
    <span title={title} className="inline-flex items-center gap-2 rounded-full border border-op-border bg-op-surface px-3 py-1 text-sm">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} aria-hidden />
      {label}
    </span>
  );
}
