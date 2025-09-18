import Footer from "@/components/footer";
import { ParentComp } from "@/components/parent-comp";
import { TanstackQueryClient } from "@/components/tanstack-query-client";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import getServerUser from "@/hooks/get-server-user";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "StudyAI - Study Smarter with AI",
    template: "%s | StudyAI",
  },
  description:
    "A one-stop learning assistant for students: summarize notes, generate quiz questions, and improve writing instantly with AI.",
  manifest: "/manifest.json",
  // themeColor: "#000000",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  keywords: [
    "AI study tools",
    "note summarizer",
    "quiz generator",
    "writing assistant",
    "student platform",
    "education technology",
  ],
  authors: [{ name: "StudyAI Team" }],
  creator: "StudyAI",
  publisher: "StudyAI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://studyaii.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://studyaii.vercel.app",
    title: "StudyAI - Study Smarter with AI",
    description:
      "A one-stop learning assistant for students: summarize notes, generate quiz questions, and improve writing instantly with AI.",
    siteName: "StudyAI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "StudyAI - AI-powered learning platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StudyAI - Study Smarter with AI",
    description:
      "A one-stop learning assistant for students: summarize notes, generate quiz questions, and improve writing instantly with AI.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerUser();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <TanstackQueryClient>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Analytics />
            <SpeedInsights />
            <Toaster />
            <ParentComp session={session}>
              <div className="w-full overflow-x-hidden pb-8 ">
                {children}
              </div>
              <Footer />
            </ParentComp>
          </ThemeProvider>
        </TanstackQueryClient>
      </body>
    </html>
  );
}
