import Link from "next/link";
import type { Metadata } from "next";
import { HeroBg } from "@/components/backgrounds";
import LoginForm from "./login-form";

export const metadata: Metadata = { title: "تسجيل الدخول" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/";

  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-14">
      <HeroBg />
      <div className="relative w-full max-w-md">
        <div className="card p-7 shadow-2xl shadow-black/50 sm:p-9">
          <p className="chip mb-4 border-gold/40 bg-gold/10 text-gold-2">أهلًا بعودتك</p>
          <h1 className="title-display text-2xl">ادخل إلى استوديوك</h1>
          <p className="mt-1.5 text-sm text-sand">أعمالك بانتظارك على جدران المعرض.</p>
          <LoginForm next={next} />
          <p className="mt-6 text-center text-sm text-sand">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="font-bold text-gold-2 hover:underline">
              أنشئ حسابًا جديدًا
            </Link>
          </p>
        </div>
        <div className="card mt-4 border-dashed p-4 text-xs leading-6 text-sand">
          <p className="font-bold text-gold-2">حسابات تجريبية للمعاينة</p>
          <p>الإدارة: <span className="font-mono" dir="ltr">admin@funoon.art / admin123</span></p>
          <p>فنان: <span className="font-mono" dir="ltr">salma@funoon.art / funoon123</span></p>
        </div>
      </div>
    </section>
  );
}
