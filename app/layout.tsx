import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/toast-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Teatch — Platform Belajar AI untuk Anak",
    template: "%s | Teatch",
  },
  description:
    "Platform edukasi berbasis AI yang membantu orang tua mengajarkan anaknya sesuai usia dan jenjang pendidikan. Buat soal otomatis, latihan interaktif, dan pantau perkembangan belajar anak.",
  keywords: [
    "edukasi anak",
    "belajar online",
    "AI learning",
    "soal latihan",
    "pendidikan",
    "homeschooling",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <ThemeProvider>
          {children}
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
