"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Compass,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PenSquare,
  Sparkles,
  Tag,
  Ticket,
  UserRound,
  X,
} from "lucide-react";
import type { SessionUser } from "@/db/schema";
import { cn, initials } from "@/lib/utils";
import { artMeta } from "@/lib/art";
import Logo from "@/components/logo";
import { logoutAction } from "@/actions/auth";

const LINKS = [
  { href: "/explore", label: "استكشاف", Icon: Compass },
  { href: "/workshops", label: "الورش", Icon: Ticket },
  { href: "/courses", label: "الكورسات", Icon: GraduationCap },
  { href: "/exams", label: "الاختبارات", Icon: Sparkles },
  { href: "/offers", label: "العروض", Icon: Tag },
];

export default function Navbar({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const logout = async () => {
    await logoutAction();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b hairline bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" aria-label="فُنون — الرئيسية" className="shrink-0">
          <Logo />
        </Link>

        <nav className="mx-auto hidden items-center gap-1 lg:flex" aria-label="التنقل الرئيسي">
          {LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  active ? "bg-gold/10 text-gold-2" : "text-sand hover:bg-white/5 hover:text-paper",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ms-auto flex items-center gap-2 lg:ms-0">
          <Link href="/upload" className="btn btn-gold btn-sm hidden sm:inline-flex">
            <PenSquare size={15} />
            ارفع عملك
          </Link>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenu((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menu}
                className="flex items-center gap-2 rounded-full border hairline bg-surface py-1 pe-3 ps-1 transition-colors hover:border-gold/50"
              >
                <span
                  className="grid size-8 place-items-center rounded-full text-xs font-bold text-coal"
                  style={{ background: artMeta(user.artType).color }}
                >
                  {initials(user.name)}
                </span>
                <span className="hidden max-w-28 truncate text-sm font-medium sm:block">{user.name}</span>
              </button>
              {menu && (
                <div
                  role="menu"
                  className="absolute end-0 top-12 w-52 overflow-hidden rounded-xl border hairline bg-panel shadow-2xl shadow-black/60"
                >
                  <Link href="/profile" role="menuitem" className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-white/5">
                    <UserRound size={15} className="text-gold" /> ملفي الشخصي
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/admin" role="menuitem" className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-white/5">
                      <LayoutDashboard size={15} className="text-gold" /> لوحة التحكم
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    role="menuitem"
                    className="flex w-full items-center gap-2 px-4 py-3 text-right text-sm text-danger hover:bg-white/5"
                  >
                    <LogOut size={15} /> تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn btn-ghost btn-sm">
              دخول
            </Link>
          )}

          <button
            className="grid size-9 place-items-center rounded-lg border hairline text-sand lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t hairline bg-coal/95 px-4 py-3 lg:hidden" aria-label="قائمة الجوال">
          {LINKS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sand hover:bg-white/5 hover:text-paper"
            >
              <Icon size={16} className="text-gold" />
              {label}
            </Link>
          ))}
          <Link href="/upload" className="btn btn-gold btn-sm mt-2 w-full">
            <PenSquare size={15} /> ارفع عملك
          </Link>
        </nav>
      )}
    </header>
  );
}
