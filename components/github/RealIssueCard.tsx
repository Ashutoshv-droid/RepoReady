// components/github/RealIssueCard.tsx
"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  ExternalLink,
  MessageSquare,
  Clock,
  Tag,
  BookmarkPlus,
  Sparkles,
  Loader2,
  ChevronUp,
} from "lucide-react";
import type { GitHubIssue } from "@/types";

interface RealIssueCardProps {
  issue: GitHubIssue;
  repoName?: string;
  repoUrl?: string;
  owner?: string;
}

function GitHubLabelBadge({ name, color }: { name: string; color: string }) {
  const hex = `#${color}`;
  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const textColor = luminance > 0.5 ? "#0f0f0f" : "#f5f5f5";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.125rem 0.5rem",
        borderRadius: "9999px",
        fontSize: "0.6875rem",
        fontWeight: 500,
        backgroundColor: `${hex}22`,
        color: hex,
        border: `1px solid ${hex}55`,
        whiteSpace: "nowrap",
      }}
      data-text-color={textColor}
    >
      {name}
    </span>
  );
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function RealIssueCard({
  issue,
  repoName,
  repoUrl,
  owner,
}: RealIssueCardProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const [trackStatus, setTrackStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [hintStatus, setHintStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [hint, setHint] = useState<string>("");
  const [hintOpen, setHintOpen] = useState(false);

  const isGoodFirstIssue = issue.labels.some((l) =>
    l.name.toLowerCase().includes("good first issue")
  );
  const isHelpWanted = issue.labels.some((l) =>
    l.name.toLowerCase().includes("help wanted")
  );

  // ── Safe URL parser — never throws ──────────────────────────
  function deriveRepoMeta() {
    try {
      const urlParts = new URL(issue.url).pathname
        .split("/")
        .filter(Boolean);
      const o = owner    ?? urlParts[0] ?? "unknown";
      const r = repoName ?? urlParts[1] ?? "unknown";
      return {
        derivedOwner:   o,
        derivedRepo:    r,
        derivedRepoUrl: repoUrl ?? `https://github.com/${o}/${r}`,
      };
    } catch {
      return {
        derivedOwner:   owner    ?? "unknown",
        derivedRepo:    repoName ?? "unknown",
        derivedRepoUrl: repoUrl  ?? "",
      };
    }
  }

  // ── Track issue ──────────────────────────────────────────────
  async function handleTrack() {
    if (trackStatus === "loading" || trackStatus === "success") return;
    setTrackStatus("loading");

    const { derivedOwner, derivedRepo, derivedRepoUrl } = deriveRepoMeta();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setTrackStatus("error");
      return;
    }

    // Duplicate check
    const { data: existing } = await supabase
      .from("user_issues")
      .select("id")
      .eq("user_id", user.id)
      .eq("issue_url", issue.url)
      .single();

    if (existing) {
      setTrackStatus("success");
      return;
    }

    const { error } = await supabase.from("user_issues").insert({
      user_id:      user.id,
      issue_number: issue.number,
      issue_title:  issue.title,
      issue_url:    issue.url,
      repo_name:    derivedRepo,
      repo_url:     derivedRepoUrl,
      owner:        derivedOwner,
      body:         issue.body ?? null,
      stage:        "tracking",
    });

    setTrackStatus(error ? "error" : "success");
  }

  // ── Get RepoReady analysis ───────────────────────────────────
  async function handleHint() {
    // Toggle off if already open and loaded
    if (hintOpen && hint) {
      setHintOpen(false);
      return;
    }
    // Re-open without re-fetching
    if (hint) {
      setHintOpen(true);
      return;
    }

    setHintStatus("loading");
    setHintOpen(true);

    const { derivedRepo, derivedRepoUrl } = deriveRepoMeta();

    try {
      const res = await fetch("/api/gemma-hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueTitle:    issue.title,
          issueBody:     issue.body    ?? "",
          issueLabels:   issue.labels.map((l) => l.name),
          issueNumber:   issue.number,
          issueComments: issue.comments,
          repoName:      derivedRepo,
          repoUrl:       derivedRepoUrl,
        }),
      });

      console.log("Gemma status:", res.status);
      const text = await res.text();
      console.log("Gemma raw response:", text);

      let data: { hint?: string; error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        setHintStatus("error");
        setHint(`Unexpected response: ${text.slice(0, 200)}`);
        return;
      }

      if (!res.ok || data.error) {
        setHintStatus("error");
        setHint(data.error ?? `Server error ${res.status}`);
      } else {
        setHint(data.hint ?? "");
        setHintStatus("success");
      }
    } catch (err) {
      console.error("Gemma fetch error:", err);
      setHintStatus("error");
      setHint(
        `Network error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  return (
    <article
      style={{
        backgroundColor: "var(--color-card)",
        border: "1px solid var(--color-subtle)",
        borderRadius: "var(--radius-lg)",
        padding: "1rem 1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        transition: "border-color 150ms ease",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.borderColor =
          "var(--color-moderate)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.borderColor =
          "var(--color-subtle)")
      }
    >
      {/* ── Row 1: issue number + beginner badges ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            color: "var(--color-muted)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          #{issue.number}
        </span>

        {isGoodFirstIssue && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.125rem 0.5rem",
              borderRadius: "9999px",
              fontSize: "0.6375rem",
              fontWeight: 600,
              backgroundColor: "rgba(184,243,107,0.1)",
              color: "var(--color-accent)",
              border: "1px solid rgba(184,243,107,0.25)",
            }}
          >
            ✦ Good first issue
          </span>
        )}

        {isHelpWanted && !isGoodFirstIssue && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.125rem 0.5rem",
              borderRadius: "9999px",
              fontSize: "0.6375rem",
              fontWeight: 600,
              backgroundColor: "rgba(251,191,36,0.1)",
              color: "#fbbf24",
              border: "1px solid rgba(251,191,36,0.25)",
            }}
          >
            Help wanted
          </span>
        )}
      </div>

      {/* ── Row 2: title ── */}
      <h3
        style={{
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          color: "var(--color-primary)",
          lineHeight: 1.45,
          margin: 0,
        }}
      >
        {issue.title}
      </h3>

      {/* ── Row 3: body preview ── */}
      {issue.body && (
        <p
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-muted)",
            lineHeight: 1.6,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {issue.body
            .replace(/#{1,6}\s/g, "")
            .replace(/\*\*/g, "")
            .replace(/`/g, "")
            .trim()}
        </p>
      )}

      {/* ── Row 4: GitHub labels ── */}
      {issue.labels.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.375rem",
            alignItems: "center",
          }}
        >
          <Tag
            size={11}
            style={{ color: "var(--color-muted)", flexShrink: 0 }}
            aria-hidden="true"
          />
          {issue.labels.map((label) => (
            <GitHubLabelBadge
              key={label.name}
              name={label.name}
              color={label.color}
            />
          ))}
        </div>
      )}

      {/* ── Row 5: RepoReady analysis panel ── */}
      {hintOpen && (
        <div
          style={{
            borderRadius: "var(--radius)",
            padding: "0.875rem 1rem",
            backgroundColor: "rgba(184,243,107,0.04)",
            borderLeft: "2px solid var(--color-accent)",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              fontSize: "0.6375rem",
              fontWeight: 600,
              color: "var(--color-accent)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            ✦ RepoReady Analysis
          </span>

          {hintStatus === "loading" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Loader2
                size={12}
                style={{
                  color: "var(--color-muted)",
                  animation: "spin 1s linear infinite",
                }}
                aria-hidden="true"
              />
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-muted)",
                }}
              >
                Analyzing issue…
              </span>
            </div>
          )}

          {(hintStatus === "success" || hintStatus === "error") && (
            <div
              style={{
                fontSize: "var(--text-xs)",
                lineHeight: 1.75,
                color:
                  hintStatus === "error"
                    ? "#f87171"
                    : "var(--color-secondary)",
                whiteSpace: "pre-wrap",
                maxHeight: "420px",
                overflowY: "auto",
                paddingRight: "0.25rem",
              }}
            >
              {hint}
            </div>
          )}
        </div>
      )}

      {/* ── Row 6: meta + actions ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          flexWrap: "wrap",
          marginTop: "auto",
          paddingTop: "0.25rem",
          borderTop: "1px solid var(--color-subtle)",
        }}
      >
        {/* Meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.875rem",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              fontSize: "0.6875rem",
              color: "var(--color-muted)",
            }}
          >
            <MessageSquare size={11} aria-hidden="true" />
            {issue.comments}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              fontSize: "0.6875rem",
              color: "var(--color-muted)",
            }}
          >
            <Clock size={11} aria-hidden="true" />
            {timeAgo(issue.updatedAt)}
          </span>
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            flexWrap: "wrap",
          }}
        >
          {/* Analyze button */}
          <button
            onClick={handleHint}
            disabled={hintStatus === "loading"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "var(--text-xs)",
              fontWeight: 500,
              color: hintOpen
                ? "var(--color-accent)"
                : "var(--color-secondary)",
              padding: "0.25rem 0.625rem",
              borderRadius: "var(--radius)",
              border: `1px solid ${
                hintOpen ? "var(--color-accent)" : "var(--color-subtle)"
              }`,
              background: hintOpen
                ? "rgba(184,243,107,0.06)"
                : "transparent",
              cursor: hintStatus === "loading" ? "default" : "pointer",
              transition:
                "color 150ms ease, border-color 150ms ease, background 150ms ease",
            }}
            onMouseEnter={(e) => {
              if (hintStatus === "loading") return;
              const el = e.currentTarget as HTMLButtonElement;
              el.style.color = "var(--color-accent)";
              el.style.borderColor = "var(--color-accent)";
            }}
            onMouseLeave={(e) => {
              if (hintOpen) return;
              const el = e.currentTarget as HTMLButtonElement;
              el.style.color = "var(--color-secondary)";
              el.style.borderColor = "var(--color-subtle)";
            }}
          >
            {hintStatus === "loading" ? (
              <Loader2
                size={11}
                style={{ animation: "spin 1s linear infinite" }}
                aria-hidden="true"
              />
            ) : hintOpen && hint ? (
              <ChevronUp size={11} aria-hidden="true" />
            ) : (
              <Sparkles size={11} aria-hidden="true" />
            )}
            {hintStatus === "loading"
              ? "Analyzing…"
              : hintOpen && hint
              ? "Hide"
              : "Analyze"}
          </button>

          {/* Track button */}
          <button
            onClick={handleTrack}
            disabled={
              trackStatus === "loading" || trackStatus === "success"
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "var(--text-xs)",
              fontWeight: 500,
              color:
                trackStatus === "success"
                  ? "var(--color-accent)"
                  : "var(--color-secondary)",
              padding: "0.25rem 0.625rem",
              borderRadius: "var(--radius)",
              border: `1px solid ${
                trackStatus === "success"
                  ? "var(--color-accent)"
                  : "var(--color-subtle)"
              }`,
              background:
                trackStatus === "success"
                  ? "rgba(184,243,107,0.06)"
                  : "transparent",
              cursor:
                trackStatus === "loading" || trackStatus === "success"
                  ? "default"
                  : "pointer",
              transition: "color 150ms ease, border-color 150ms ease",
            }}
            onMouseEnter={(e) => {
              if (trackStatus !== "idle") return;
              const el = e.currentTarget as HTMLButtonElement;
              el.style.color = "var(--color-accent)";
              el.style.borderColor = "var(--color-accent)";
            }}
            onMouseLeave={(e) => {
              if (trackStatus !== "idle") return;
              const el = e.currentTarget as HTMLButtonElement;
              el.style.color = "var(--color-secondary)";
              el.style.borderColor = "var(--color-subtle)";
            }}
          >
            {trackStatus === "loading" ? (
              <Loader2
                size={11}
                style={{ animation: "spin 1s linear infinite" }}
                aria-hidden="true"
              />
            ) : (
              <BookmarkPlus size={11} aria-hidden="true" />
            )}
            {trackStatus === "loading"
              ? "Saving…"
              : trackStatus === "success"
              ? "Tracked ✓"
              : trackStatus === "error"
              ? "Retry"
              : "Track"}
          </button>

          {/* View on GitHub */}
          <a
            href={issue.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              fontSize: "var(--text-xs)",
              fontWeight: 500,
              color: "var(--color-secondary)",
              textDecoration: "none",
              padding: "0.25rem 0.625rem",
              borderRadius: "var(--radius)",
              border: "1px solid var(--color-subtle)",
              transition: "color 150ms ease, border-color 150ms ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.color = "var(--color-accent)";
              el.style.borderColor = "var(--color-accent)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.color = "var(--color-secondary)";
              el.style.borderColor = "var(--color-subtle)";
            }}
          >
            <ExternalLink size={11} aria-hidden="true" />
            GitHub
          </a>
        </div>
      </div>
    </article>
  );
}
