import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer"
import { Toaster } from "@/components/ui/toaster";
import getServerUser from "@/hooks/get-server-user";
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "StudyAI - Study Smarter with AI",
    template: "%s | StudyAI",
  },
  description:
    "A one-stop learning assistant for students: summarize notes, generate quiz questions, and improve writing instantly with AI.",
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
    // creator: "@studyai",
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
   
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerUser();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Analytics/>
          <Toaster/>
          <Navigation session={session}/>
          <div className="min-h-dvh w-full overflow-x-hidden   md:pt-[100px] pt-[80px] pb-[50px]  flex flex-col items-center justify-center px-4">
            {children}
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
