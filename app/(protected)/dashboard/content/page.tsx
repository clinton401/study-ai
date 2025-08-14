import {FC} from "react";
import {ContentPageUI} from "@/components/content-page-ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content ",
  description:
    "Browse and manage all your AI-generated content, including essays, term papers, and letters created with StudyAI.",
  keywords: [
    "AI essays",
    "AI term papers",
    "AI letters",
    "study content",
    "generated content",
    "StudyAI content",
  ],
  openGraph: {
    title: "Content ",
    description:
      "Access your AI-generated essays, term papers, and letters in one organized place with StudyAI.",
    url: "https://studyaii.vercel.app/dashboard/content",
    // images: ["/og-content.jpg"],
  },
  alternates: {
    canonical: "/dashboard/content",
  },
};


const ContentPage : FC = () => {
    return <ContentPageUI />
}

export default ContentPage