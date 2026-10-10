"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import RepoRoadmapCard from "@/components/RepoRoadmapCard";

type Repo = {
  id: string;
  repo_name: string;
  repo_url: string;
  stage: string;
  notes?: string;
};

export default function RoadmapPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const [repos, setRepos]   = useState<Repo[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [level, setLevel]   = useState<string>("beginner");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: repoData }, { data: skillData }, { data: profileData }] =
        await Promise.all([
          supabase.from("user_repos").select("*").eq("user_id", user.id),
          supabase.from("user_skills").select("name").eq("user_id", user.id),
          supabase.from("user_profiles").select("experience_level").eq("user_id", user.id).single(),
        ]);

      setRepos(repoData || []);
      setSkills(skillData?.map((s: any) => s.name) || []);
      setLevel(profileData?.experience_level || "beginner");
      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-400 animate-pulse">Loading your roadmap...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">
        Contribution Roadmap
      </h1>
      <p className="text-sm text-zinc-400 mb-8">
        Hover over a card for a moment to get a hint from Gemma ✨
      </p>

      {repos.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <p className="text-lg">No repos tracked yet.</p>
          <p className="text-sm mt-1">Add repos from your settings to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {repos.map((repo) => (
            <RepoRoadmapCard
              key={repo.id}
              repo={repo}
              experienceLevel={level}
              skills={skills}
            />
          ))}
        </div>
      )}
    </div>
  );
}
