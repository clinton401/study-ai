import type { Metadata } from "next";
import { AnalyticsCards } from "@/components/analytics-card";
import { DashboardUI } from "@/components/dashboard-ui";
export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Access your personalized StudyAI dashboard. Review your study progress, AI-generated summaries, and insights in one place.",
  keywords: [
    "study dashboard",
    "learning analytics",
    "AI study tools",
    "study progress",
    "StudyAI dashboard",
    "student dashboard",
  ],
  openGraph: {
    title: "Dashboard",
    description:
      "Stay on top of your learning with the StudyAI dashboard. View progress, summaries, and AI-powered study recommendations.",
    url: "https://studyaii.vercel.app/dashboard",
  },
  alternates: {
    canonical: "/dashboard",
  },
};

export default function Dashboard() {
  return (
    <main className="w-full">
      <div className="flex flex-col gap-6 p-6  w-full ">
        <AnalyticsCards />
        <DashboardUI />
      </div>
    </main>
  );
}
