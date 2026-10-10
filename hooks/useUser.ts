// hooks/useUser.ts
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get current session user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    // Keep in sync if session changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Pull useful fields from GitHub OAuth metadata
  const meta = user?.user_metadata ?? {};
// ─── Stats & levelling ───────────────────────────────────────────
// Replace this mock array later with a real Supabase fetch
const contributions: { difficulty: "easy" | "medium" | "hard" }[] = [];

const XP_MAP = { easy: 10, medium: 25, hard: 60 };

const totalXP = contributions.reduce(
  (sum, c) => sum + XP_MAP[c.difficulty],
  0
);

const LEVELS = [
  { label: "Beginner",     minXP: 0   },
  { label: "Explorer",     minXP: 50  },
  { label: "Contributor",  minXP: 150 },
  { label: "Maintainer",   minXP: 350 },
  { label: "Expert",       minXP: 700 },
];

const currentLevel = [...LEVELS]
  .reverse()
  .find((l) => totalXP >= l.minXP)?.label ?? "Beginner";

const stats = {
  issuesExplored:          0,               // hook up later
  contributionsCompleted:  contributions.length,
  skillsInProgress:        0,               // hook up later
  currentLevel,
  totalXP,
};




  return {
    user,
    stats,

    loading,
    name:         (meta.full_name ?? meta.name ?? meta.user_name ?? "User") as string,
    githubHandle: (meta.user_name ?? "") as string,
    avatarUrl:    (meta.avatar_url ?? "") as string,
    email:        (user?.email ?? "") as string,
    // Initials fallback if avatar image fails
    initials: ((meta.full_name ?? meta.user_name ?? "U") as string)
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
  };
}
