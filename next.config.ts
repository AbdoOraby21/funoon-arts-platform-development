import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // رفع الأعمال (صور/صوت/فيديو) بحد ٦MB لبيئة المعاينة
      bodySizeLimit: "7mb",
    },
  },
};

export default nextConfig;
