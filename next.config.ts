import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. The parent XAMPP htdocs folder
  // contains an unrelated lockfile, which otherwise confuses root inference.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
