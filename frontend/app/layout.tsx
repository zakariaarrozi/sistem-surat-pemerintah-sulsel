import type { Metadata } from "next";
import "./globals.css";
import ToastContainer from "./components/Toast";
import Watermark from "./components/Watermark";

export const metadata: Metadata = {
  title: "Sistem Surat Sulsel — Pemerintah Provinsi Sulawesi Selatan",
  description:
    "Sistem Pengelolaan Surat Pemerintah Provinsi Sulawesi Selatan. Platform digital untuk manajemen surat masuk dan keluar secara terintegrasi.",
  keywords: "sistem surat, sulawesi selatan, persuratan, pemerintah",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        {children}
        <ToastContainer />
        <Watermark />
      </body>
    </html>
  );
}
