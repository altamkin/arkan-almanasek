import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  // skipWaiting: true,

  // buildExcludes: [/locales\/.*\.json$/, /\/api\//], // don't include locale JSONs or API
  // add runtimeCaching here if needed
});
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Required for small production Docker images (copies traced deps into .next/standalone)
  output: "standalone",
  // undici is Node-only; used by instrumentation.ts for longer fetch connect timeouts in dev
  serverExternalPackages: ["undici"],
  images: {
    // Allow optimized loading of remote ActiveStorage blob redirects
    remotePatterns: [
      {
        protocol: "https", // Staging now served over HTTPS
        hostname: "staging.macs.com.sa",
        port: "",
        pathname: "/rails/active_storage/blobs/redirect/**",
      },
      {
        protocol: "https", // Production (adjust if different)
        hostname: "macs.com.sa",
        port: "",
        pathname: "/rails/active_storage/blobs/redirect/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/aida-public/**",
      },
    ],
  },
};

export default withPWA(withNextIntl(nextConfig));
