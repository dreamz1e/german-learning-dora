import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppBackground } from "@/components/ui/AppBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "German Learning Dora - AI-Powered Language Learning",
  description:
    "Master German with AI-generated exercises, gamification, and daily challenges. Level A2-B1 for English speakers.",
  keywords: [
    "German learning",
    "language learning",
    "AI",
    "gamification",
    "A2",
    "B1",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen text-foreground`}
      >
        <AppBackground />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
