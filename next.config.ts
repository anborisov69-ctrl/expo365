import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    remotePatterns: [
      {
        protocol: "https",
        // Это разрешает все домены (удобно для разработки; для продакшена лучше перечислить хосты)
        hostname: "**"
      }
    ]
  }
};

export default nextConfig;
