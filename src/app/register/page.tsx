import Link from "next/link";
import type { Metadata } from "next";
import { HeroBg } from "@/components/backgrounds";
import RegisterForm from "./register-form";

export const metadata: Metadata = { title: "حساب جديد" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function RegisterPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/profile";

  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-14">
      <HeroBg />
      <div className="relative w-full max-w-lg">
        <div className="card p-7 shadow-2xl shadow-black/50 sm:p-9">
          <p className="chip mb-4 border-gold/40 bg-gold/10 text-gold-2">انضم إلى فُنون</p>
          <h1 className="title-display text-2xl">افتح حساب فنان</h1>
          <p className="mt-1.5 text-sm leading-7 text-sand">
            التحقق برقم هاتفك عبر كود OTP — ثم ابدأ النشر فورًا.
          </p>
          <RegisterForm next={next} />
          <p className="mt-6 text-center text-sm text-sand">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="font-bold text-gold-2 hover:underline">
              سجّل الدخول
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
