import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Indikator turbopack Next.js (logo N) di versi terbaru tidak bisa disembunyikan
  // sepenuhnya via konfigurasi type-safe, kecuali dengan merubah posisi:
  // devIndicators: { position: "bottom-right" }
};

export default nextConfig;
