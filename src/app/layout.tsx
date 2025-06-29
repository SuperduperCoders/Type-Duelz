import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Load Google Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// SEO & Metadata Configuration
export const metadata: Metadata = {
  title: "TypeDuels",
  description: "Compete in real-time typing duels and improve your skills!",
  keywords: [
    "TypeDuels",
    "typing game",
    "duel",
    "multiplayer typing",
    "typing test",
    "keyboard training",
    "online typing battle"
  ],
  authors: [{ name: "Daniel Solimani" }],
  creator: "Daniel Solimani",
  metadataBase: new URL("https://typeduels.com"),
  openGraph: {
    title: "TypeDuels",
    description: "Compete in real-time typing duels and improve your skills!",
    url: "https://typeduels.com",
    siteName: "TypeDuels",
    images: [
      {
        url: "/og-image.png", // Put this in your /public folder
        width: 1200,
        height: 630,
        alt: "TypeDuels gameplay screenshot",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TypeDuels",
    description: "Compete in real-time typing duels and improve your skills!",
    images: ["/og-image.png"],
    creator: "@yourTwitterHandle", // Optional, add your handle
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
