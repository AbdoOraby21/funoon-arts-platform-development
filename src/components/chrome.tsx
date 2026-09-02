"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { SessionUser } from "@/db/schema";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

/** يخفي الهيدر/الفوتر عن لوحة الأدمن وصفحات الشهادات */
export default function Chrome({ user, children }: { user: SessionUser | null; children: ReactNode }) {
  const pathname = usePathname();
  const bare = pathname.startsWith("/admin") || pathname.endsWith("/certificate");
  if (bare) return <>{children}</>;
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
