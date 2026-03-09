import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Nunito, Kantumruy_Pro } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const khmer = Kantumruy_Pro({
  variable: "--font-khmer",
  subsets: ["khmer"],
});

export const metadata: Metadata = {
  title: "Holiday Buddy - Your Cute Holiday Calendar",
  description:
    "A cute and feature-rich holiday calendar for Cambodia and beyond.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Holiday Buddy",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffd6e0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} ${khmer.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
