import Provider from "./components/auth/provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JourIn: AI-Powered Journaling",
  description: "Your personal journaling companion, powered by AI.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JourIn",
  },

  twitter: {
    card: "summary",
    title: "JourIn",
    description: "Turn your daily reflections into engaging LinkedIn content. JourIn is a smart journaling tool that uses AI to generate professional posts from your journal entries, helping you build your personal brand.",
    images: ["https://jour-in.vercel.app/icons/android-chrome-192x192.png"],
    creator: "@RuslanTsykaliak",
  },
  openGraph: {
    type: "website",
    title: "JourIn",
    description: "Turn your daily reflections into engaging LinkedIn content. JourIn is a smart journaling tool that uses AI to generate professional posts from your journal entries, helping you build your personal brand.",
    siteName: "JourIn",
    url: "https://jour-in.vercel.app/",
    images: [
      {
        url: "https://jour-in.vercel.app/icons/apple-touch-icon.png",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png" },
    ],
    shortcut: "/icons/favicon.ico",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-gray-100`}
      >
        <Provider>{children}</Provider>
        <Toaster />
      </body>
    </html>
  );
}