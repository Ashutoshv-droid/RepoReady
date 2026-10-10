// app/discover/page.tsx
"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { demoIssues } from "@/lib/demo-data";
import { IssueCard } from "@/components/dashboard/IssueCard";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import type { Difficulty } from "@/types";

const ALL_LANGUAGES = Array.from(new Set(demoIssues.map((i) => i.language)));
const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced"];

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "all">("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return demoIssues.filter((issue) => {
      const matchesQuery =
        query.trim() === "" ||
        issue.title.toLowerCase().includes(query.toLowerCase()) ||
        issue.repository.toLowerCase().includes(query.toLowerCase()) ||
        issue.skills.some((s) => s.toLowerCase().includes(query.toLowerCase()));

      const matchesDifficulty =
        selectedDifficulty === "all" || issue.difficulty === selectedDifficulty;

      const matchesLanguage =
        selectedLanguage === "all" || issue.language === selectedLanguage;

      return matchesQuery && matchesDifficulty && matchesLanguage;
    });
  }, [query, selectedDifficulty, selectedLanguage]);

  const hasActiveFilters =
    selectedDifficulty !== "all" || selectedLanguage !== "all";

  const clearFilters = () => {
    setSelectedDifficulty("all");
    setSelectedLanguage("all");
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search issues, repos, or skills…"
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded outline-none"
            style={{
              backgroundColor: "var(--bg-panel)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) =>
              ((e.currentTarget as HTMLInputElement).style.borderColor = "var(--accent)")
            }
            onBlur={(e) =>
              ((e.currentTarget as HTMLInputElement).style.borderColor = "var(--border)")
            }
          />
        </div>

        {/* Filter toggle (mobile) */}
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm rounded sm:hidden"
          style={{
            backgroundColor: "var(--bg-panel)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "var(--accent)" }}
            />
          )}
        </button>

        {/* Desktop filters inline */}
        <div className="hidden sm:flex items-center gap-2">
          <FilterPills
            difficulties={DIFFICULTIES}
            languages={ALL_LANGUAGES}
            selectedDifficulty={selectedDifficulty}
            selectedLanguage={selectedLanguage}
            onDifficultyChange={setSelectedDifficulty}
            onLanguageChange={setSelectedLanguage}
          />
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded"
              style={{
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Mobile filter panel */}
      {filtersOpen && (
        <div
          className="sm:hidden rounded-lg p-4 mb-4"
          style={{
            backgroundColor: "var(--bg-panel)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex flex-wrap gap-2">
            <FilterPills
              difficulties={DIFFICULTIES}
              languages={ALL_LANGUAGES}
              selectedDifficulty={selectedDifficulty}
              selectedLanguage={selectedLanguage}
              onDifficultyChange={setSelectedDifficulty}
              onLanguageChange={setSelectedLanguage}
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 flex items-center gap-1 text-xs"
              style={{ color: "var(--accent)" }}
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
        {filtered.length} issue{filtered.length !== 1 ? "s" : ""} found
        {hasActiveFilters ? " with active filters" : ""} — demo data
      </p>

      {/* Issue grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-lg"
          style={{
            backgroundColor: "var(--bg-panel)",
            border: "1px solid var(--border)",
          }}
        >
          <Search className="w-8 h-8 mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            No issues match your filters
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Try adjusting your search or clearing filters.
          </p>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Sub-component: filter pills
// ──────────────────────────────────────────────
interface FilterPillsProps {
  difficulties: Difficulty[];
  languages: string[];
  selectedDifficulty: Difficulty | "all";
  selectedLanguage: string;
  onDifficultyChange: (d: Difficulty | "all") => void;
  onLanguageChange: (l: string) => void;
}

function FilterPills({
  difficulties,
  languages,
  selectedDifficulty,
  selectedLanguage,
  onDifficultyChange,
  onLanguageChange,
}: FilterPillsProps) {
  return (
    <>
      {/* Difficulty */}
      {(["all", ...difficulties] as Array<"all" | Difficulty>).map((d) => {
        const active = selectedDifficulty === d;
        return (
          <button
            key={d}
            onClick={() => onDifficultyChange(d)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors duration-150"
            style={{
              backgroundColor: active ? "var(--accent)" : "var(--bg-card)",
              color: active ? "#0f0f0f" : "var(--text-secondary)",
              border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
            }}
          >
            {d === "all" ? (
              "All levels"
            ) : (
              <DifficultyBadge difficulty={d} />
            )}
          </button>
        );
      })}

      {/* Language */}
      {(["all", ...languages] as string[]).map((l) => {
        const active = selectedLanguage === l;
        return (
          <button
            key={l}
            onClick={() => onLanguageChange(l)}
            className="px-2.5 py-1.5 rounded text-xs font-medium transition-colors duration-150"
            style={{
              backgroundColor: active ? "var(--bg-hover)" : "transparent",
              color: active ? "var(--text-primary)" : "var(--text-secondary)",
              border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
            }}
          >
            {l === "all" ? "All languages" : l}
          </button>
        );
      })}
    </>
  );
}
