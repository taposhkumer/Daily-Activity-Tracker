import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow opening the dev server via LAN IP (e.g. 192.168.x.x) in Chrome/Firefox/Brave
  allowedDevOrigins: ["192.168.0.107"],
};

export default nextConfig;
