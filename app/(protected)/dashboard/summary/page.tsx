import {FC} from "react";
import { SummaryPageUI } from "@/components/summary-page-ui";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Summaries ",
  description:
    "View AI-generated summaries of your study materials and interact with them by asking AI follow-up questions for deeper understanding.",
  keywords: [
    "study summaries",
    "AI summaries",
    "study notes",
    "AI Q&A",
    "study help",
    "summary generator",
  ],
  openGraph: {
    title: "Summaries ",
    description:
      "Review your AI-generated summaries and ask AI questions to clarify and expand your understanding.",
    url: "https://studyaii.vercel.app/dashboard/summaries",
    // images: ["/og-summaries.jpg"],
  },
  alternates: {
    canonical: "/dashboard/summaries",
  },
};


const SummaryPage : FC = () => {
    return <SummaryPageUI />
}

export default SummaryPage;