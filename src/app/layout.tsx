// ...existing code...
import XPBar from './components/XPBar';
import { type Metadata } from 'next';
// ...existing code...
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import BackgroundMusic from './BackgroundMusic';
import { ClerkProvider } from '@clerk/nextjs';
import { XPProvider } from './XPProvider';

// Load Google Fonts
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// SEO & Metadata Configuration
export const metadata: Metadata = {
  title: 'TypeDuels',
  description: 'Pro typing game with real-time multiplayer duels',
  authors: [{ name: 'TypeDuels Team', url: 'https://typeduels.com' }],
  
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#000000" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <BackgroundMusic />
          {/* XPProvider wraps the app for XP state */}
          <XPProvider>
            {/* XPBar shows XP and level, positioned center-left */}
            <XPBar />
            {children}
          </XPProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
