import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Smart Dip Accumulator & Dashboard | Gold & Silver ETF Surveillance',
  description:
    'End-to-end quantitative surveillance and accumulation system for GoldBEES and SilverBEES ETFs with >99% mathematical accuracy, Vercel Serverless Cron, Human-in-the-loop controls, and AI Co-Pilot.',
  keywords: [
    'GoldBEES',
    'SilverBEES',
    'ETF Dip Accumulator',
    'Quantitative Finance',
    'RSI 14',
    '50 EMA',
    'Vercel Serverless',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="bg-[#080C14] text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
