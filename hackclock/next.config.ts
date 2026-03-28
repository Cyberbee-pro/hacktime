import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use this to handle the Lucide and standard packages
  transpilePackages: ["lucide-react"],
  
  // If you are using Tailwind, ensure it's handled by the standard PostCSS loader
  // We'll fix the path issue in the PostCSS config instead of here.
};

export default nextConfig;