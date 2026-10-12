import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["natural", "mongodb", "pg", "pdf-parse", "wink-nlp", "wink-pos-tagger"],
};

export default nextConfig;

