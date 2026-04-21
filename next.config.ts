import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  async redirects() {
    return [{ source: "/buyer/:path*", destination: "/visitor/:path*", permanent: true }];
  },
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb"
    }
  },
  images: {
    domains: ["placehold.co", "via.placeholder.com"],
    /** Явные хосты: шаблон `**` в hostname в Next 15 даёт непредсказуемое поведение для next/image */
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "i.picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "via.placeholder.com", pathname: "/**" },
      { protocol: "https", hostname: "randomuser.me", pathname: "/**" },
      /** Абсолютные URL загрузок в dev (например http://localhost:3001/uploads/...) */
      { protocol: "http", hostname: "localhost", pathname: "/**" },
      { protocol: "http", hostname: "127.0.0.1", pathname: "/**" }
    ]
  }
};

export default nextConfig;
