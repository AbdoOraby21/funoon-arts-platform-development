import Link from "next/link";
import Logo from "@/components/logo";

export default function Footer() {
  return (
    <footer className="border-t hairline bg-coal">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="space-y-3 md:col-span-2">
          <Logo />
          <p className="max-w-sm text-sm leading-7 text-sand">
            «فُنون» بيتُ الفنون العربية: مساحة واحدة يجتمع فيها الرسّام والموسيقي والكاتب والمصوّر وصانع الأفلام —
            يشارك، يتعلّم، ويُقيَّم فنه بما يستحق.
          </p>
        </div>
        <div>
          <h3 className="title-display mb-3 text-sm text-gold-2">المنصة</h3>
          <ul className="space-y-2 text-sm text-sand">
            <li><Link className="hover:text-paper" href="/explore">استكشاف الأعمال</Link></li>
            <li><Link className="hover:text-paper" href="/workshops">الورش</Link></li>
            <li><Link className="hover:text-paper" href="/courses">الكورسات</Link></li>
            <li><Link className="hover:text-paper" href="/offers">العروض</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="title-display mb-3 text-sm text-gold-2">فُنون</h3>
          <ul className="space-y-2 text-sm text-sand">
            <li><Link className="hover:text-paper" href="/p/about">من نحن</Link></li>
            <li><Link className="hover:text-paper" href="/p/terms">شروط الاستخدام</Link></li>
            <li><Link className="hover:text-paper" href="/p/privacy">سياسة الخصوصية</Link></li>
            <li><Link className="hover:text-paper" href="/admin">دخول الإدارة</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t hairline py-4 text-center text-xs text-sand/70">
        فُنون © {new Date().getFullYear()} — صُنع بحُبّ للفن العربي
      </div>
    </footer>
  );
}
