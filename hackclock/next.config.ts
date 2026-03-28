import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fixes the "multiple lockfiles" path resolution issue
  serverExternalPackages: ["tailwindcss"],
  
  // Resolves the "Blocked cross-origin request" warning in your logs
  // Replace the IP with the one from your terminal output if it changes
  experimental: {
    allowedDevOrigins: ["10.9.161.140:3000", "localhost:3000"],
  },

  // Ensures Turbopack stays focused on the local node_modules
  transpilePackages: ["lucide-react"],
};

export default nextConfig;
