import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { getSessionUser } from "@/lib/auth";
import Chrome from "@/components/chrome";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "فُنون — بيتُ الفنون العربية",
    template: "%s | فُنون",
  },
  description:
    "منصة عربية تجمع الرسم والموسيقى والكتابة والتصوير والفيديو في استوديو واحد: شارك أعمالك، اختبر مستواك، واحجز ورشًا وكورسات.",
  openGraph: {
    title: "فُنون — بيتُ الفنون العربية",
    description: "مساحة واحدة لكل الفنون.",
    type: "website",
    locale: "ar_AR",
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <html lang="ar" dir="rtl">
      <body className="bg-ink text-paper font-body antialiased">
        {/* خطوط عربية: Cairo للعناوين وTajawal للنصوص */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800;900&family=Tajawal:wght@300;400;500;700;800&display=swap"
        />

        <Chrome user={user}>{children}</Chrome>
      </body>
    </html>
  );
}