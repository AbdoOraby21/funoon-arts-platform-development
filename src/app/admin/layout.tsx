import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import AdminNav from "./admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();
  return (
    <div dir="rtl" className="min-h-screen bg-coal text-paper">
      <AdminNav userName={user.name} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
