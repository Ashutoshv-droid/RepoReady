// app/discover/page.tsx
"use client";

import { useState, useMemo, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  Search,
  SlidersHorizontal,
  X,
  GitBranch,
  Star,
  AlertCircle,
  Loader2,
  CircleSlash,
  BookmarkPlus,
  ExternalLink,
} from "lucide-react";
import { demoIssues } from "@/lib/demo-data";
import { IssueCard } from "@/components/dashboard/IssueCard";
import { RealIssueCard } from "@/components/github/RealIssueCard";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import type {
  Difficulty,
  GitHubRepository,
  GitHubIssue,
  GitHubSearchResult,
  GitHubSearchError,
} from "@/types";

// ── Demo filter constants ──────────────────────────────────────
const ALL_LANGUAGES = Array.from(new Set(demoIssues.map((i) => i.language)));
const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced"];

// ── Repo search state shape ────────────────────────────────────
type SearchStatus = "idle" | "loading" | "success" | "error";

interface RepoState {
  status: SearchStatus;
  repository: GitHubRepository | null;
  issues: GitHubIssue[];
  errorMessage: string;
}

const INITIAL_REPO_STATE: RepoState = {
  status: "idle",
  repository: null,
  issues: [],
  errorMessage: "",
};

// ── Basic URL validation before hitting the network ───────────
function validateGitHubUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Please enter a GitHub repository URL.";
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return "That doesn't look like a valid URL.";
  }
  if (parsed.hostname !== "github.com") return "URL must point to github.com.";
  if (parsed.protocol !== "https:") return "URL must use HTTPS.";
  const parts = parsed.pathname.split("/").filter(Boolean);
  if (parts.length !== 2) return "Use a URL like https://github.com/owner/repo.";
  return null; // valid
}

// ── Repo stats bar ─────────────────────────────────────────────
function RepoStatsBar({
  repo,
  onTrack,
  trackStatus,
}: {
  repo: GitHubRepository;
  onTrack: () => void;
  trackStatus: "idle" | "loading" | "success" | "error";
}) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-card)",
        border: "1px solid var(--color-subtle)",
        borderRadius: "var(--radius-lg)",
        padding: "1rem 1.25rem",
        marginBottom: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.625rem",
      }}
    >
      {/* Name + language badge */}
      <div
        style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}
      >
        <GitBranch
          size={14}
          style={{ color: "var(--color-accent)", flexShrink: 0 }}
        />
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: 700,
            color: "var(--color-primary)",
            textDecoration: "none",
            letterSpacing: "-0.015em",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color =
              "var(--color-accent)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color =
              "var(--color-primary)")
          }
        >
          {repo.name}
        </a>
        {repo.language && (
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: 500,
              color: "var(--color-secondary)",
              backgroundColor: "var(--color-elevated)",
              border: "1px solid var(--color-subtle)",
              borderRadius: "var(--radius-sm)",
              padding: "0.0625rem 0.4rem",
            }}
          >
            {repo.language}
          </span>
        )}
      </div>

      {/* Description */}
      {repo.description && (
        <p
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-secondary)",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {repo.description}
        </p>
      )}

      {/* Stats row */}
      <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
        <Stat
          icon={<Star size={11} />}
          label={`${repo.stars.toLocaleString()} stars`}
        />
        <Stat
          icon={<GitBranch size={11} />}
          label={`${repo.openIssues.toLocaleString()} open issues`}
        />
      </div>

      {/* ── Action buttons ── */}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
        {/* Visit GitHub */}
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
        >
          <ExternalLink size={13} aria-hidden="true" />
          Visit GitHub
        </a>

        {/* Track Repo */}
        <button
          onClick={onTrack}
          disabled={trackStatus === "loading" || trackStatus === "success"}
          className="btn btn-primary btn-sm"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
        >
          {trackStatus === "loading" ? (
            <Loader2 size={13} className="animate-spin" aria-hidden="true" />
          ) : (
            <BookmarkPlus size={13} aria-hidden="true" />
          )}
          {trackStatus === "loading"
            ? "Tracking…"
            : trackStatus === "success"
            ? "Tracked ✓"
            : trackStatus === "error"
            ? "Retry"
            : "Track Repo"}
        </button>
      </div>
    </div>
  );
}

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        fontSize: "0.6875rem",
        color: "var(--color-muted)",
      }}
    >
      {icon}
      {label}
    </span>
  );
}

// ── Main page (inner) ──────────────────────────────────────────
function DiscoverPageInner() {
  // ── NEW: read ?repo= query param ──────────────────────────────
  const searchParams = useSearchParams();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  // Real repo search state
  const [repoUrl, setRepoUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [repoState, setRepoState] = useState<RepoState>(INITIAL_REPO_STATE);
  const [trackStatus, setTrackStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  // Demo filter state (only shown when no real search is active)
  const [query, setQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    Difficulty | "all"
  >("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const isRealSearchActive = repoState.status !== "idle";

  // ── NEW: on mount, read ?repo= and auto-fetch if present ──────
  useEffect(() => {
    const repoParam = searchParams.get("repo");
    if (!repoParam) return;

    // Strip any /issues/123 suffix down to just owner/repo
    let repoRoot = repoParam;
    try {
      const parsed = new URL(repoParam);
      const parts = parsed.pathname.split("/").filter(Boolean);
      repoRoot = `https://github.com/${parts[0]}/${parts[1]}`;
    } catch {
      repoRoot = repoParam;
    }

    setRepoUrl(repoRoot);

    const validationError = validateGitHubUrl(repoRoot);
    if (validationError) {
      setUrlError(validationError);
      return;
    }

    setUrlError("");
    setTrackStatus("idle");
    setRepoState({ ...INITIAL_REPO_STATE, status: "loading" });

    fetch(`/api/github/issues?url=${encodeURIComponent(repoRoot)}`)
      .then((res) => res.json())
      .then((data: GitHubSearchResult | GitHubSearchError) => {
        if ("error" in data) {
          setRepoState({
            ...INITIAL_REPO_STATE,
            status: "error",
            errorMessage: data.error,
          });
          return;
        }
        setRepoState({
          status: "success",
          repository: data.repository,
          issues: data.issues,
          errorMessage: "",
        });
      })
      .catch(() => {
        setRepoState({
          ...INITIAL_REPO_STATE,
          status: "error",
          errorMessage:
            "Unable to reach the server. Check your connection and try again.",
        });
      });
  }, []); // runs once on mount
  // ── END NEW ───────────────────────────────────────────────────

  // ── Fetch handler ─────────────────────────────────────────────
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateGitHubUrl(repoUrl);
    if (validationError) {
      setUrlError(validationError);
      inputRef.current?.focus();
      return;
    }
    setUrlError("");
    setTrackStatus("idle");
    setRepoState({ ...INITIAL_REPO_STATE, status: "loading" });

    try {
      const res = await fetch(
        `/api/github/issues?url=${encodeURIComponent(repoUrl.trim())}`
      );
      const data: GitHubSearchResult | GitHubSearchError = await res.json();

      if (!res.ok || "error" in data) {
        setRepoState({
          ...INITIAL_REPO_STATE,
          status: "error",
          errorMessage:
            "error" in data
              ? data.error
              : "Something went wrong. Please try again.",
        });
        return;
      }

      setRepoState({
        status: "success",
        repository: data.repository,
        issues: data.issues,
        errorMessage: "",
      });
    } catch {
      setRepoState({
        ...INITIAL_REPO_STATE,
        status: "error",
        errorMessage:
          "Unable to reach the server. Check your connection and try again.",
      });
    }
  }

  // ── Track repo handler ───────────────────────────────────────
  async function handleTrackRepo() {
    if (!repoState.repository) return;
    setTrackStatus("loading");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setTrackStatus("error");
      return;
    }

    const repo = repoState.repository;
    const parts = new URL(repo.url).pathname.split("/").filter(Boolean);
    const owner = parts[0];
    const repoName = parts[1];

    // Check if already tracked
    const { data: existing } = await supabase
      .from("user_repos")
      .select("id")
      .eq("user_id", user.id)
      .eq("repo_url", repo.url)
      .single();

    if (existing) {
      setTrackStatus("success");
      return;
    }

    const { error } = await supabase.from("user_repos").insert({
      user_id: user.id,
      repo_url: repo.url,
      repo_name: repoName,
      owner: owner,
      stage: "exploring",
    });

    setTrackStatus(error ? "error" : "success");
  }

  // ── Clear real search, go back to demo ───────────────────────
  function clearSearch() {
    setRepoUrl("");
    setUrlError("");
    setTrackStatus("idle");
    setRepoState(INITIAL_REPO_STATE);
  }

  // ── Demo filtering (only used when real search is idle) ──────
  const filteredDemo = useMemo(() => {
    return demoIssues.filter((issue) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q === "" ||
        issue.title.toLowerCase().includes(q) ||
        issue.repository.toLowerCase().includes(q) ||
        issue.skills.some((s) => s.toLowerCase().includes(q));
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
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

      {/* ══════════════════════════════════════════════════════
          SECTION 1 — Real GitHub repo search bar
          Always visible at the top.
      ══════════════════════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-subtle)",
          borderRadius: "var(--radius-lg)",
          padding: "1.25rem",
          marginBottom: "2rem",
        }}
      >
        <p
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: 600,
            color: "var(--color-accent)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: "0.75rem",
          }}
        >
          Search a GitHub Repo
        </p>

        <form
          onSubmit={handleSearch}
          style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
        >
          <div
            style={{
              position: "relative",
              flex: "1 1 260px",
              minWidth: 0,
            }}
          >
            <Search
              size={14}
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-muted)",
                pointerEvents: "none",
              }}
            />
            <input
              ref={inputRef}
              className="input"
              type="url"
              value={repoUrl}
              onChange={(e) => {
                setRepoUrl(e.target.value);
                setUrlError("");
              }}
              placeholder="https://github.com/owner/repo"
              autoComplete="off"
              spellCheck={false}
              aria-label="GitHub repository URL"
              aria-describedby={urlError ? "url-error" : undefined}
              style={{
                paddingLeft: "2.25rem",
                borderColor: urlError
                  ? "var(--color-danger, #f87171)"
                  : undefined,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={repoState.status === "loading"}
            className="btn btn-primary btn-md"
            style={{ flexShrink: 0 }}
          >
            {repoState.status === "loading" ? (
              <>
                <Loader2
                  size={14}
                  aria-hidden="true"
                  style={{ animation: "spin 1s linear infinite" }}
                />
                Fetching…
              </>
            ) : (
              <>
                <Search size={14} aria-hidden="true" />
                Fetch Issues
              </>
            )}
          </button>

          {isRealSearchActive && (
            <button
              type="button"
              onClick={clearSearch}
              className="btn btn-ghost btn-md"
              style={{ flexShrink: 0 }}
            >
              <X size={13} aria-hidden="true" />
              Clear
            </button>
          )}
        </form>

        {/* Inline URL validation error */}
        {urlError && (
          <p
            id="url-error"
            role="alert"
            style={{
              marginTop: "0.5rem",
              fontSize: "var(--text-xs)",
              color: "var(--color-danger, #f87171)",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            <AlertCircle size={12} aria-hidden="true" />
            {urlError}
          </p>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 2A — Real search results
          Shown only when a real search has been triggered.
      ══════════════════════════════════════════════════════ */}
      {isRealSearchActive && (
        <section>
          {/* Loading */}
          {repoState.status === "loading" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "4rem 1.5rem",
                gap: "0.75rem",
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-subtle)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <Loader2
                size={28}
                className="animate-spin"
                style={{ color: "var(--color-accent)" }}
                aria-hidden="true"
              />
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-muted)",
                }}
              >
                Fetching issues from GitHub…
              </p>
            </div>
          )}

          {/* Error */}
          {repoState.status === "error" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "3rem 1.5rem",
                gap: "0.5rem",
                textAlign: "center",
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-subtle)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <AlertCircle
                size={24}
                style={{ color: "var(--color-danger, #f87171)" }}
                aria-hidden="true"
              />
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  color: "var(--color-primary)",
                }}
              >
                {repoState.errorMessage}
              </p>
              <button
                onClick={clearSearch}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: "0.5rem" }}
              >
                Try again
              </button>
            </div>
          )}

          {/* Success */}
          {repoState.status === "success" && repoState.repository && (
            <>
              <RepoStatsBar
                repo={repoState.repository}
                onTrack={handleTrackRepo}
                trackStatus={trackStatus}
              />

              <p
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-muted)",
                  marginBottom: "1rem",
                }}
              >
                Showing{" "}
                <span
                  style={{
                    color: "var(--color-secondary)",
                    fontWeight: 600,
                  }}
                >
                  {repoState.issues.length}
                </span>{" "}
                open{" "}
                {repoState.issues.length === 1 ? "issue" : "issues"} — live
                from GitHub
              </p>

              {repoState.issues.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4rem 1.5rem",
                    gap: "0.75rem",
                    textAlign: "center",
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-subtle)",
                    borderRadius: "var(--radius-lg)",
                  }}
                >
                  <CircleSlash
                    size={28}
                    style={{ color: "var(--color-muted)" }}
                    aria-hidden="true"
                  />
                  <p
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--color-muted)",
                    }}
                  >
                    No open issues found for this repository.
                  </p>
                </div>
              ) : (
                <div className="issue-grid">
                  {repoState.issues.map((issue) => {
                    const parts = new URL(repoState.repository!.url).pathname
                      .split("/")
                      .filter(Boolean);
                    const owner = parts[0];
                    const repo = parts[1];
                    return (
                      <RealIssueCard
                        key={issue.id}
                        issue={issue}
                        owner={owner}
                        repoName={repo}
                        repoUrl={repoState.repository?.url}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          SECTION 2B — Demo issues
          Shown only when no real search is active.
      ══════════════════════════════════════════════════════ */}
      {!isRealSearchActive && (
        <section>
          {/* Section header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <p
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                color: "var(--color-primary)",
                margin: 0,
              }}
            >
              Example issues
            </p>
            <span
              style={{
                padding: "0.0625rem 0.4rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.6rem",
                fontWeight: 600,
                backgroundColor: "var(--color-elevated)",
                color: "var(--color-muted)",
                border: "1px solid var(--color-subtle)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Demo
            </span>
          </div>

          {/* Search + filter bar */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.625rem",
              alignItems: "stretch",
              marginBottom: filtersOpen ? "0.625rem" : "1rem",
            }}
          >
            {/* Text search */}
            <div
              style={{ position: "relative", flex: "1 1 220px", minWidth: 0 }}
            >
              <Search
                size={14}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--color-muted)",
                  pointerEvents: "none",
                }}
              />
              <input
                className="input"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, repo, or skill…"
                aria-label="Search demo issues"
                style={{
                  paddingLeft: "2.25rem",
                  paddingRight: query ? "2.25rem" : "0.75rem",
                }}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  style={{
                    position: "absolute",
                    right: "0.625rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--color-muted)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: "2px",
                    borderRadius: "var(--radius-sm)",
                    transition: "color 150ms ease",
                  }}
                >
                  <X size={13} aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Filters toggle */}
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className="btn btn-secondary btn-md"
              aria-expanded={filtersOpen}
              aria-controls="demo-filters"
              style={{
                flexShrink: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
            >
              <SlidersHorizontal size={13} aria-hidden="true" />
              Filters
              {hasActiveFilters && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-accent)",
                    color: "var(--color-bg)",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                  }}
                >
                  {(selectedDifficulty !== "all" ? 1 : 0) +
                    (selectedLanguage !== "all" ? 1 : 0)}
                </span>
              )}
            </button>

            {(hasActiveFilters || query) && (
              <button
                onClick={() => {
                  clearFilters();
                  setQuery("");
                }}
                className="btn btn-ghost btn-md"
                style={{ flexShrink: 0 }}
              >
                <X size={13} aria-hidden="true" />
                Clear
              </button>
            )}
          </div>

          {/* Filter panel */}
          {filtersOpen && (
            <div
              id="demo-filters"
              style={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: "1rem 1.25rem",
                marginBottom: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.875rem",
              }}
            >
              <div>
                <p className="section-label" style={{ marginBottom: "0.5rem" }}>
                  Difficulty
                </p>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}
                >
                  <FilterPills
                    type="difficulty"
                    difficulties={DIFFICULTIES}
                    languages={[]}
                    selectedDifficulty={selectedDifficulty}
                    selectedLanguage={selectedLanguage}
                    onDifficultyChange={setSelectedDifficulty}
                    onLanguageChange={setSelectedLanguage}
                  />
                </div>
              </div>
              <div>
                <p className="section-label" style={{ marginBottom: "0.5rem" }}>
                  Language
                </p>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}
                >
                  <FilterPills
                    type="language"
                    difficulties={DIFFICULTIES}
                    languages={ALL_LANGUAGES}
                    selectedDifficulty={selectedDifficulty}
                    selectedLanguage={selectedLanguage}
                    onDifficultyChange={setSelectedDifficulty}
                    onLanguageChange={setSelectedLanguage}
                  />
                </div>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn btn-ghost btn-sm"
                  style={{ alignSelf: "flex-start" }}
                >
                  <X size={12} aria-hidden="true" />
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Result count */}
          <p
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-muted)",
              marginBottom: "1rem",
            }}
          >
            Showing{" "}
            <span style={{ color: "var(--color-secondary)", fontWeight: 600 }}>
              {filteredDemo.length}
            </span>{" "}
            {filteredDemo.length === 1 ? "issue" : "issues"}
            {hasActiveFilters ? " with active filters" : ""} — demo data
          </p>

          {/* Demo grid or empty state */}
          {filteredDemo.length > 0 ? (
            <div className="issue-grid">
              {filteredDemo.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "4rem 1.5rem",
                textAlign: "center",
                gap: "0.75rem",
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-subtle)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <Search
                size={28}
                style={{ color: "var(--color-muted)" }}
                aria-hidden="true"
              />
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  color: "var(--color-secondary)",
                }}
              >
                No issues match your filters
              </p>
              <p
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-muted)",
                  maxWidth: "260px",
                }}
              >
                Try adjusting your search or clearing filters.
              </p>
              <button
                onClick={() => {
                  clearFilters();
                  setQuery("");
                }}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: "0.25rem" }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

/* ── FilterPills sub-component — unchanged logic ────────────── */
interface FilterPillsProps {
  type?: "difficulty" | "language" | "all";
  difficulties: Difficulty[];
  languages: string[];
  selectedDifficulty: Difficulty | "all";
  selectedLanguage: string;
  onDifficultyChange: (d: Difficulty | "all") => void;
  onLanguageChange: (l: string) => void;
}

function FilterPills({
  type = "all",
  difficulties,
  languages,
  selectedDifficulty,
  selectedLanguage,
  onDifficultyChange,
  onLanguageChange,
}: FilterPillsProps) {
  return (
    <>
      {(type === "all" || type === "difficulty") &&
        (["all", ...difficulties] as Array<"all" | Difficulty>).map((d) => {
          const active = selectedDifficulty === d;
          return (
            <button
              key={d}
              onClick={() => onDifficultyChange(d)}
              aria-pressed={active}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.25rem 0.75rem",
                borderRadius: "var(--radius-full)",
                fontSize: "var(--text-xs)",
                fontWeight: 500,
                cursor: "pointer",
                border: `1px solid ${
                  active ? "var(--color-accent)" : "var(--color-subtle)"
                }`,
                color: active
                  ? "var(--color-accent)"
                  : "var(--color-secondary)",
                backgroundColor: active
                  ? "var(--color-accent-muted)"
                  : "transparent",
                transition: "all 150ms ease",
              }}
            >
              {d === "all" ? "All" : <DifficultyBadge difficulty={d} />}
            </button>
          );
        })}

      {(type === "all" || type === "language") &&
        (["all", ...languages] as string[]).map((lang) => {
          const active = selectedLanguage === lang;
          return (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              aria-pressed={active}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.25rem 0.75rem",
                borderRadius: "var(--radius-full)",
                fontSize: "var(--text-xs)",
                fontWeight: 500,
                cursor: "pointer",
                border: `1px solid ${
                  active ? "var(--color-accent)" : "var(--color-subtle)"
                }`,
                color: active
                  ? "var(--color-accent)"
                  : "var(--color-secondary)",
                backgroundColor: active
                  ? "var(--color-accent-muted)"
                  : "transparent",
                transition: "all 150ms ease",
              }}
            >
              {lang === "all" ? "All" : lang}
            </button>
          );
        })}
    </>
  );
}

// ── NEW: Suspense wrapper required by Next.js for useSearchParams ──
export default function DiscoverPage() {
  return (
    <Suspense fallback={null}>
      <DiscoverPageInner />
    </Suspense>
  );
}
