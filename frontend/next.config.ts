import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['http://localhost:3000', 'http://192.168.82.14:3000', 'http://172.20.10.4:3000'],
};

export default nextConfig;
