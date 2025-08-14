import type { Metadata } from "next"
import { SettingsClient } from "@/components/settings-client";
import getServerUser from "@/hooks/get-server-user";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Manage your StudyAI account settings. Update your profile, change preferences, manage notifications, and more.",
  keywords: [
    "account settings",
    "profile settings",
    "preferences",
    "StudyAI settings",
    "user account",
    "privacy settings",
  ],
  openGraph: {
    title: "Settings",
    description: "Manage your StudyAI account settings and preferences.",
    url: "https://studyaii.vercel.app/settings",
    // images: ["/og-settings.jpg"],
  },
  alternates: {
    canonical: "/settings",
  },
}

export default async function SettingsPage() {
    const session = await getServerUser();
    if(!session) return;
  return (
      <main>
        <SettingsClient session={session}/>
      </main>
  )
}
