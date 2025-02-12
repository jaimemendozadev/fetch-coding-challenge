import type { Metadata } from 'next';
import { HeroUIProvider } from '@heroui/react';
import { Toaster } from 'react-hot-toast';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import StoreProvider from '@/utils/store';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Adoptogram 💗',
  description: 'Get matched with cute 🐶 dogs for adoption'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster />
        <HeroUIProvider>
          <StoreProvider>{children}</StoreProvider>
        </HeroUIProvider>
      </body>
    </html>
  );
}
