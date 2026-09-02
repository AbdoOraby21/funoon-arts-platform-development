"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------ زر نسخ كود العرض ------------------------------ */
export function CopyCodeButton({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className={cn("btn btn-ghost btn-sm font-mono tracking-widest", className)}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
        } catch {
          /* clipboard قد يكون غير متاح */
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      aria-live="polite"
    >
      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
      {copied ? "تم النسخ!" : code}
    </button>
  );
}

/* ------------------------------ زر طباعة ------------------------------ */
export function PrintButton({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <button onClick={() => window.print()} className={cn("btn btn-gold", className)}>
      <Printer size={16} />
      {children}
    </button>
  );
}

/* ------------------------------ تأكيد حذف ------------------------------ */
export function ConfirmSubmit({
  label,
  confirm = "متأكد؟",
  className,
  danger = true,
}: {
  label: ReactNode;
  confirm?: string;
  className?: string;
  danger?: boolean;
}) {
  const [armed, setArmed] = useState(false);
  return (
    <button
      type={armed ? "submit" : "button"}
      onClick={() => setArmed(true)}
      onBlur={() => setArmed(false)}
      className={cn("btn btn-sm", danger ? "btn-danger" : "btn-ghost", className)}
    >
      {armed ? confirm : label}
    </button>
  );
}
