import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * حماية سريعة بالكوكي فقط (فحص كامل داخل الصفحات نفسها).
 * /exams نفسها عامة، أما أداء الاختبار /exams/[id] فيتطلب دخولًا.
 */
export function middleware(req: NextRequest) {
  const token = req.cookies.get("funoon_session")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    const redirectTo = url.pathname + url.search;
    const login = new URL("/login", req.url);
    login.searchParams.set("next", redirectTo);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/upload", "/profile", "/exams/:path+"],
};
