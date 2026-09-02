"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  FileText,
  GraduationCap,
  Globe,
  LayoutDashboard,
  Tag,
  Users,
} from "lucide-react";
import Logo from "@/components/logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "الإحصائيات", Icon: LayoutDashboard },
  { href: "/admin/users", label: "المستخدمون", Icon: Users },
  { href: "/admin/exams", label: "الاختبارات", Icon: ClipboardList },
  { href: "/admin/content", label: "الورش والكورسات", Icon: GraduationCap },
  { href: "/admin/offers", label: "العروض", Icon: Tag },
  { href: "/admin/pages", label: "الصفحات", Icon: FileText },
];

export default function AdminNav({ userName }: { userName: string }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b hairline bg-coal/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Logo size={26} />
        <span className="chip border-gold/40 bg-gold/10 text-gold-2">لوحة الإدارة</span>
        <span className="ms-auto hidden text-xs text-sand sm:block">مرحبًا، {userName}</span>
        <Link href="/" className="btn btn-ghost btn-sm">
          <Globe size={14} /> الموقع
        </Link>
      </div>
      <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6" aria-label="أقسام الإدارة">
        {LINKS.map(({ href, label, Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                active ? "bg-gold/15 text-gold-2" : "text-sand hover:bg-white/5 hover:text-paper",
              )}
            >
              <Icon size={13} />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
