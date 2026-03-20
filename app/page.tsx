"use client";

import { useState, useEffect } from "react";
import type { UserProfile } from "@/lib/types";
import { loadProfile } from "@/lib/storage";
import SetupWizard from "@/components/SetupWizard";
import Feed from "@/components/Feed";

type View = "loading" | "setup" | "feed";

export default function Home() {
  const [view, setView] = useState<View>("loading");
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const saved = loadProfile();
    if (saved) {
      setProfile(saved);
      setView("feed");
    } else {
      setView("setup");
    }
  }, []);

  function handleSetupComplete(p: UserProfile) {
    setProfile(p);
    setView("feed");
  }

  function handleEditProfile() {
    setView("setup");
  }

  if (view === "loading") {
    return <div className="min-h-screen bg-zinc-50" />;
  }

  if (view === "setup") {
    return (
      <SetupWizard
        onComplete={handleSetupComplete}
        initialProfile={profile}
      />
    );
  }

  return (
    <Feed
      profile={profile!}
      onEditProfile={handleEditProfile}
    />
  );
}
