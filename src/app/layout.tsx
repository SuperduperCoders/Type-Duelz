// app/layout.tsx
import XPBar from './components/XPBar';
import { type Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import BackgroundMusic from './BackgroundMusic';
import { MusicProvider } from './MusicProvider';
import { Analytics } from "@vercel/analytics/next";
import { XPProvider } from './XPProvider';
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TypeDuels',
  description: 'Pro typing game with real-time multiplayer duels',
  authors: [{ name: 'TypeDuels Team', url: 'https://typeduels.com' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white`}
        >
          <MusicProvider>
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-lg">
              <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-blue-500 bg-clip-text text-transparent animate-text-shimmer">
                  TypeDuels
                </h1>
                <div className="flex items-center gap-6">
                  {/* Fake Player Count */}
                  <div className="flex items-center gap-2 text-gray-300">
                    <span className="text-sm opacity-75">Players</span>
                    <span className="font-semibold text-lg text-white drop-shadow-md">10,000+</span>
                  </div>

                  <SignedOut>
                    <SignInButton>
                      <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition">
                        Sign In
                      </button>
                    </SignInButton>
                  </SignedOut>

                  <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                </div>
              </div>
            </header>

            <BackgroundMusic />

            {/* Hero Section */}
            <SignedOut>
              <main className="relative flex flex-col items-center justify-center text-center py-24 px-6 space-y-12">
                {/* Animated Gradient Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-black/90 blur-3xl -z-10 animate-pulse-slow" />

                {/* Headline */}
                <h2 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-500 bg-clip-text text-transparent animate-gradient-x">
                  The Ultimate Typing Duel Game.
                </h2>
                <p className="max-w-2xl md:max-w-3xl text-lg md:text-xl text-gray-300 leading-relaxed">
                  Battle in real-time typing duels, climb the ranks, and prove you’re the fastest typer online.
                </p>

                {/* CTA */}
                <SignInButton>
                  <button className="px-10 md:px-12 py-4 md:py-5 rounded-2xl text-xl md:text-2xl bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 font-extrabold text-black shadow-xl hover:shadow-pink-500/30 hover:scale-110 transition-all duration-300">
                    Start Battling Now
                  </button>
                </SignInButton>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mt-20">
                  <div className="p-6 rounded-2xl bg-white/5 border border-purple-400/20 shadow-md hover:scale-105 hover:shadow-purple-500/20 transition">
                    <h3 className="text-2xl font-bold mb-3 text-purple-400">⚔️ Real-Time Duels</h3>
                    <p className="text-gray-300">Challenge opponents instantly in fast-paced typing battles.</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-blue-400/20 shadow-md hover:scale-105 hover:shadow-blue-500/20 transition">
                    <h3 className="text-2xl font-bold mb-3 text-blue-400">📈 Progression</h3>
                    <p className="text-gray-300">Earn XP, unlock rewards, and watch your typing speed skyrocket.</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-green-400/20 shadow-md hover:scale-105 hover:shadow-green-500/20 transition">
                    <h3 className="text-2xl font-bold mb-3 text-green-400">🏆 Leaderboards</h3>
                    <p className="text-gray-300">Compete against others for the best player in TypeDuels.</p>
                  </div>
                </div>
              </main>
            </SignedOut>

            {/* Signed In Content */}
            <XPProvider>
              <XPBar />
              <SignedIn>{children}</SignedIn>
            </XPProvider>
          </MusicProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
