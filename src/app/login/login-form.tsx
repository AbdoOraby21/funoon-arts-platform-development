"use client";

import { useActionState } from "react";
import { AlertCircle, LogIn } from "lucide-react";
import { googleSignInAction, loginAction } from "@/actions/auth";

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41 35.6 44 30.3 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="mt-7 space-y-4">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <label htmlFor="email" className="label">البريد الإلكتروني</label>
          <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="input" dir="ltr" />
        </div>
        <div>
          <label htmlFor="password" className="label">كلمة المرور</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" className="input" dir="ltr" />
        </div>
        {state?.error && (
          <p role="alert" className="flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            <AlertCircle size={15} /> {state.error}
          </p>
        )}
        <button type="submit" disabled={pending} className="btn btn-gold w-full">
          <LogIn size={16} />
          {pending ? "جارٍ الدخول…" : "تسجيل الدخول"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-sand" aria-hidden="true">
        <span className="h-px flex-1 bg-line-strong" />
        أو
        <span className="h-px flex-1 bg-line-strong" />
      </div>

      <form action={googleSignInAction}>
        <input type="hidden" name="next" value={next} />
        <button type="submit" className="btn btn-ghost w-full">
          <GoogleMark />
          الدخول عبر Google
        </button>
      </form>
    </div>
  );
}
