import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ToastProvider } from '@/components/providers/toast-provider';

const sourceSans = localFont({
  src: '../public/fonts/SourceSans3VF-Upright.woff2',
  weight: '200 900',
  style: 'normal',
  variable: '--font-source-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.teatch.my.id'),
  title: {
    default: 'Teatch - Platform Belajar Berbasis AI untuk Anak',
    template: '%s | Teatch',
  },
  description:
    'Platform edukasi berbasis AI yang membantu orang tua mengajarkan anaknya sesuai usia dan jenjang pendidikan. Buat soal otomatis, latihan interaktif, dan pantau perkembangan belajar anak.',
  keywords: [
    'edukasi anak',
    'belajar online',
    'AI learning',
    'soal latihan',
    'pendidikan',
    'homeschooling',
  ],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://www.teatch.my.id',
    siteName: 'Teatch',
    title: 'Teatch - Platform Belajar Berbasis AI untuk Anak',
    description:
      'Generate soal latihan otomatis sesuai usia, kelas, dan topik. Pantau perkembangan belajar anak dengan alat yang mudah, cepat, dan interaktif. Gratis untuk dicoba.',
    images: [
      {
        url: '/teatch_logo.png',
        width: 2816,
        height: 1536,
        alt: 'Teatch - Platform Belajar Berbasis AI untuk Anak',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Teatch - Platform Belajar Berbasis AI untuk Anak',
    description:
      'Generate soal latihan otomatis sesuai usia, kelas, dan topik. Pantau perkembangan belajar anak dengan alat yang mudah, cepat, dan interaktif.',
    images: ['/teatch_logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${sourceSans.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans antialiased">
        <ThemeProvider>
          {children}
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
