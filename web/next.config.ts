import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Statische Seite: `npm run build` erzeugt den Ordner `out/` für Cloudflare Pages
  output: "export",
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
};

export default nextConfig;
