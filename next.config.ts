/** @type {import('next').NextConfig} */
import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  experimental: {
    turbo: false, // 👈 force Webpack instead of Turbopack
  },
};

export default withPWA(nextConfig);
