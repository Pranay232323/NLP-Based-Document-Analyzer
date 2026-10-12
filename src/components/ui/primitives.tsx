import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm ${className}`}>{children}</div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div>
        <h3 className="text-sm font-semibold tracking-wide text-slate-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}

type BadgeTone = "indigo" | "emerald" | "amber" | "rose" | "slate" | "sky" | "violet";

const toneMap: Record<BadgeTone, string> = {
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  sky: "bg-sky-50 text-sky-700 ring-sky-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
};

export function Badge({ children, tone = "slate", className = "" }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneMap[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function StatCard({ label, value, hint, tone = "indigo" }: { label: string; value: string | number; hint?: string; tone?: BadgeTone }) {
  return (
    <Card className="p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {hint && (
        <p className="mt-1">
          <Badge tone={tone}>{hint}</Badge>
        </p>
      )}
    </Card>
  );
}

export function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="mb-6">
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">{eyebrow}</p>}
      <h1 className="mt-1 text-2xl font-bold text-slate-900">{title}</h1>
      {description && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{description}</p>}
    </div>
  );
}

export function EmptyState({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <Card className="flex flex-col items-center gap-4 p-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">📄</div>
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </Card>
  );
}

export function Spinner({ className = "", size = 16 }: { className?: string; size?: number }) {
  return (
    <svg style={{ width: size, height: size }} className={`animate-spin text-current shrink-0 ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}


export function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
