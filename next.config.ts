import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["tesseract.js", "@napi-rs/canvas", "unpdf", "pdfjs-dist"],
};

export default nextConfig;
