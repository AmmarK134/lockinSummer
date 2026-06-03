import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import ServiceWorkerRegistrar from "@/components/layout/ServiceWorkerRegistrar";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LockIn — Fitness Tracker",
  description: "Your personal fitness, nutrition, and habit tracker. Level up your life.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LockIn",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#070b14",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.variable}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LockIn" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="mask-icon" href="/icon.svg" color="#06b6d4" />
      </head>
      <body>
        <ServiceWorkerRegistrar />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
