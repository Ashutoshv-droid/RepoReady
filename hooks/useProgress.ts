// hooks/useProgress.ts
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { demoSkills, demoAchievements } from "@/lib/demo-data";
import type { Skill, Achievement } from "@/types";

interface ProgressData {
  skills: Skill[];
  achievements: Achievement[];
  earnedCount: number;
  totalCount: number;
  loading: boolean;
}

export function useProgress(): ProgressData {
  const { user } = useUser();
  const [skills, setSkills] = useState<Skill[]>(demoSkills);
  const [achievements, setAchievements] = useState<Achievement[]>(demoAchievements);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      // Not logged in — keep demo data
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function fetchProgress() {
      setLoading(true);

      // ── Skills ──────────────────────────────────────────────────
      const { data: skillRows } = await supabase
        .from("user_skills")
        .select("name, level")
        .eq("user_id", user!.id);

      if (skillRows && skillRows.length > 0) {
        setSkills(skillRows as Skill[]);
      }
      // else: keep demoSkills as fallback

      // ── Achievements ────────────────────────────────────────────
      const { data: achRows } = await supabase
        .from("user_achievements")
        .select("id, title, description, icon, earned, earned_date, category")
        .eq("user_id", user!.id);

      if (achRows && achRows.length > 0) {
        setAchievements(
          achRows.map((r) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            icon: r.icon,
            earned: r.earned,
            earnedDate: r.earned_date ?? undefined,
            category: r.category,
          })) as Achievement[]
        );
      }
      // else: keep demoAchievements as fallback

      setLoading(false);
    }

    fetchProgress();
  }, [user]);

  const earnedCount = achievements.filter((a) => a.earned).length;

  return {
    skills,
    achievements,
    earnedCount,
    totalCount: achievements.length,
    loading,
  };
}
