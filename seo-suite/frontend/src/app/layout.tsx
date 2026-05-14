import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SEO Suite',
    template: '%s — SEO Suite',
  },
  description: 'Domain Authority + Backlink Checker',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
