import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { artMeta, levelMeta } from "@/lib/art";
import { cn } from "@/lib/utils";

/* ------------------------------ شريحة نوع الفن ------------------------------ */
export function TypeChip({ type, className, withLabel = true }: { type: string; className?: string; withLabel?: boolean }) {
  const meta = artMeta(type);
  const Icon = meta.Icon;
  return (
    <span
      className={cn("chip", className)}
      style={{ color: meta.color, borderColor: `${meta.color}55`, background: meta.soft }}
    >
      <Icon size={13} strokeWidth={2.4} />
      {withLabel && meta.ar}
    </span>
  );
}

/* ------------------------------ شارة المستوى ------------------------------ */
export function LevelBadge({ level, className }: { level: string; className?: string }) {
  const meta = levelMeta(level);
  return (
    <span
      className={cn("chip", className)}
      style={{ color: meta.color, borderColor: `${meta.color}55`, background: `${meta.color}1c` }}
    >
      <span className="size-1.5 rounded-full" style={{ background: meta.color }} />
      {meta.ar}
    </span>
  );
}

/* ------------------------------ حالة فارغة ------------------------------ */
export function EmptyState({
  Icon,
  title,
  hint,
  action,
  className,
}: {
  Icon: LucideIcon;
  title: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("card flex flex-col items-center gap-3 border-dashed px-6 py-14 text-center", className)}>
      <span className="grid size-14 place-items-center rounded-2xl bg-gold/10 text-gold">
        <Icon size={26} />
      </span>
      <h3 className="title-display text-lg text-paper">{title}</h3>
      {hint && <p className="max-w-md text-sm leading-7 text-sand">{hint}</p>}
      {action}
    </div>
  );
}

/* ------------------------------ بطاقة إحصائية ------------------------------ */
export function StatCard({
  Icon,
  label,
  value,
  hint,
  accent = "#d9a648",
}: {
  Icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="card relative overflow-hidden p-5">
      <div
        className="absolute -top-8 end-[-24px] size-24 rounded-full opacity-20"
        style={{ background: accent, filter: "blur(28px)" }}
      />
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl" style={{ background: `${accent}22`, color: accent }}>
          <Icon size={20} />
        </span>
        <div>
          <p className="text-xs text-sand">{label}</p>
          <p className="title-display text-2xl leading-7 text-paper">{value}</p>
        </div>
      </div>
      {hint && <p className="mt-3 text-xs leading-5 text-sand/80">{hint}</p>}
    </div>
  );
}

/* ------------------------------ ترويسة قسم ------------------------------ */
export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  action,
  accent = "#d9a648",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        {eyebrow && (
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold tracking-wide" style={{ color: accent }}>
            <span className="inline-block h-px w-8" style={{ background: accent }} />
            {eyebrow}
          </p>
        )}
        <h2 className="title-display text-3xl text-paper sm:text-4xl">{title}</h2>
        <svg className="mt-1.5 h-2.5 w-40" viewBox="0 0 160 10" aria-hidden="true">
          <path d="M4 6 C 45 1 80 9 122 4 S 152 6 156 5" stroke={accent} strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.7" />
        </svg>
        {subtitle && <p className="mt-2 max-w-xl text-sm leading-7 text-sand">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------ أزرار إجراءات صغيرة ------------------------------ */
export function IconLabel({ Icon, children, color }: { Icon: LucideIcon; children: ReactNode; color?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5" style={{ color: color ?? "var(--color-gold)" }}>
      <Icon size={13} strokeWidth={2.4} />
      {children}
    </span>
  );
}
