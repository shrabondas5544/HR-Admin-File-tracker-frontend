import type { NextConfig } from "next";

const nextConfig = {
  experimental: {
    allowedHosts: ['.trycloudflare.com'],
  },
};

module.exports = nextConfig;
