// ...existing code...
import XPBar from './components/XPBar';
import { type Metadata } from 'next';
// ...existing code...
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import BackgroundMusic from './BackgroundMusic';
// ...removed ClerkProvider import...
import { XPProvider } from './XPProvider';
import{ClerkProvider, SignedIn, SignedOut, SignIn, SignInButton, SignOutButton, UserButton} from '@clerk/nextjs'; 

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
  <header className="flex items-center gap-4 p-4" style={{background: 'rgb(0,0,0)', color: '#fff'}}>
          
          <h1 className="text-4xl font-bold mb-8 text-purple-700 dark:text-purple-300 drop-shadow-lg">TypeDuels</h1>
          <SignedIn>
            <SignOutButton>
              <button
                className="ml-4 px-5 py-2 font-semibold rounded-lg bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <span className="inline-flex items-center gap-2">
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1' /></svg>
                  Sign Out
                </span>
              </button>
            </SignOutButton>
          </SignedIn>
        </header>
        <BackgroundMusic />
        {/* XPProvider wraps the app for XP state */}
        <XPProvider>
          {/* XPBar shows XP and level, positioned center-left */}
          <XPBar />
          

            
          <SignedOut>
            <SignInButton>
              <button
                className="px-10 py-5 text-2xl font-bold rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 text-white shadow-2xl hover:scale-105 hover:shadow-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-400"
              >
                <span className="inline-flex items-center gap-4">
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12H3m0 0l4-4m-4 4l4 4m6-8v16' /></svg>
                  Sign In
                </span>
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            {children}
          </SignedIn>
        </XPProvider>

      </body>

    </html>
    </ClerkProvider>
  );
}

