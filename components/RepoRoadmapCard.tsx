"use client";

import { useState, useRef } from "react";

const STAGES = ["exploring", "setting-up", "first-issue", "pr-open", "pr-merged"];

type Repo = {
  id: string;
  repo_name: string;
  repo_url: string;
  stage: string;
  notes?: string;
};

type Props = {
  repo: Repo;
  experienceLevel?: string;
  skills?: string[];
};

export default function RepoRoadmapCard({ repo, experienceLevel, skills }: Props) {
  const [hint, setHint]       = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  const stageIndex = STAGES.indexOf(repo.stage);

  const fetchHint = async () => {
    if (hint) { setExpanded(true); return; } // already fetched, just expand
    setLoading(true);
    setExpanded(true);
    try {
      const res = await fetch("/api/gemma-hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoName:        repo.repo_name,
          stage:           repo.stage,
          notes:           repo.notes,
          experienceLevel: experienceLevel,
          skills:          skills,
        }),
      });
      const data = await res.json();
      setHint(data.hint);
    } catch {
      setHint("Couldn't load hint right now. Try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => {
      fetchHint();
    }, 1200); // 1.2s long hover
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setExpanded(false);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700
        rounded-2xl p-5 shadow-sm cursor-pointer
        transition-all duration-500 ease-in-out
        ${expanded ? "shadow-lg scale-[1.02]" : "hover:shadow-md"}
      `}
    >
      {/* Repo name + link */}
      <div className="flex items-center justify-between mb-3">
        <a
          href={repo.repo_url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-zinc-800 dark:text-zinc-100 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {repo.repo_name}
        </a>
        <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-1 rounded-full">
          {repo.stage}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mb-3">
        {STAGES.map((s, i) => (
          <div
            key={s}
            title={s}
            className={`
              h-2 flex-1 rounded-full transition-all duration-300
              ${i <= stageIndex
                ? "bg-indigo-500"
                : "bg-zinc-200 dark:bg-zinc-700"}
            `}
          />
        ))}
      </div>

      {/* Notes */}
      {repo.notes && (
        <p className="text-xs text-zinc-400 mb-2">{repo.notes}</p>
      )}

      {/* Gemma hint — expands on long hover */}
      <div
        className={`
          overflow-hidden transition-all duration-500
          ${expanded ? "max-h-40 opacity-100 mt-3" : "max-h-0 opacity-0"}
        `}
      >
        <div className="border-t border-zinc-100 dark:border-zinc-700 pt-3">
          <p className="text-xs text-indigo-400 font-medium mb-1">✨ Gemma hint</p>
          {loading ? (
            <p className="text-xs text-zinc-400 animate-pulse">Thinking...</p>
          ) : (
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {hint}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
