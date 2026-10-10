// components/dashboard/IssueCard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ← NEW
import {
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Hash,
  ArrowRight,
  GitBranch,
} from "lucide-react";
import type { Issue } from "@/types";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { SkillTag } from "@/components/ui/SkillTag";

interface IssueCardProps {
  issue: Issue;
  onViewDetails?: (issue: Issue) => void;
}

export function IssueCard({ issue, onViewDetails }: IssueCardProps) {
  const [bookmarked, setBookmarked] = useState(issue.isBookmarked ?? false);
  const [hovered, setHovered] = useState(false);
  const router = useRouter(); // ← NEW

  // ← NEW: extract repo root from the issue's GitHub URL and navigate
  function handleViewDetails() {
    if (onViewDetails) {
      onViewDetails(issue);
      return;
    }
    // issue.githubUrl is like https://github.com/owner/repo/issues/123
    // Strip it down to https://github.com/owner/repo for the discover page
    try {
      const parsed = new URL(issue.githubUrl);
      const parts = parsed.pathname.split("/").filter(Boolean);
      const repoRoot = `https://github.com/${parts[0]}/${parts[1]}`;
      router.push(`/discover?repo=${encodeURIComponent(repoRoot)}`);
    } catch {
      // Fallback: just pass the raw URL and let discover handle it
      router.push(`/discover?repo=${encodeURIComponent(issue.githubUrl)}`);
    }
  }

  return (
    <article
      className="flow-card"
      aria-label={`Issue: ${issue.title}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Expanding fill — rises from bottom on hover ──────── */}
      <div className="flow-card-fill" aria-hidden="true" />

      {/* ── All content above the fill ───────────────────────── */}
      <div className="flow-card-content">

        {/* ── Row 1: Repo + issue number + bookmark ────────────── */}
        <div className="flow-card-header">
          <div className="flow-card-repo">
            <GitBranch
              size={11}
              strokeWidth={2}
              aria-hidden="true"
              style={{ flexShrink: 0, color: "var(--color-muted)" }}
            />
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={issue.repository}
            >
              {issue.repository}
            </span>

            {/* Issue number */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.15rem",
                color: "var(--color-muted)",
                flexShrink: 0,
                marginLeft: "0.25rem",
              }}
            >
              <Hash size={10} strokeWidth={2} aria-hidden="true" />
              {issue.issueNumber}
            </span>

            {/* Language pill */}
            {issue.language && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0.0625rem 0.4rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.625rem",
                  fontWeight: 500,
                  color: "var(--color-secondary)",
                  backgroundColor: "var(--color-elevated)",
                  border: "1px solid var(--color-subtle)",
                  flexShrink: 0,
                  marginLeft: "0.25rem",
                  whiteSpace: "nowrap",
                  transition: "color 300ms ease, background-color 300ms ease",
                }}
                className="flow-card-lang-pill"
              >
                {issue.language}
              </span>
            )}
          </div>

          {/* Bookmark button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setBookmarked((b) => !b);
            }}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark issue"}
            aria-pressed={bookmarked}
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "26px",
              height: "26px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid transparent",
              background: "transparent",
              color: bookmarked ? "var(--color-accent)" : "var(--color-muted)",
              cursor: "pointer",
              transition:
                "color 200ms ease, border-color 200ms ease, background-color 200ms ease",
              position: "relative",
              zIndex: 2,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "var(--color-subtle)";
              el.style.backgroundColor = "var(--color-elevated)";
              if (!bookmarked) el.style.color = "var(--color-secondary)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "transparent";
              el.style.backgroundColor = "transparent";
              if (!bookmarked) el.style.color = "var(--color-muted)";
            }}
          >
            {bookmarked ? (
              <BookmarkCheck size={13} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Bookmark size={13} strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>

        {/* ── Row 2: Issue title ────────────────────────────────── */}
        <h3 className="flow-card-title">{issue.title}</h3>

        {/* ── Row 3: Difficulty + GitHub labels ────────────────── */}
        <div className="flow-card-tags">
          <DifficultyBadge difficulty={issue.difficulty} />
          {issue.labels.map((label) => (
            <span key={label} className="gh-label">
              {label}
            </span>
          ))}
        </div>

        {/* ── Row 4: Required skills ────────────────────────────── */}
        {issue.skills.length > 0 && (
          <div className="flow-card-skills">
            <span
              className="text-2xs"
              style={{
                color: "var(--color-muted)",
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              Skills
            </span>
            {issue.skills.slice(0, 4).map((skill) => (
              <SkillTag key={skill} name={skill} variant="compact" />
            ))}
            {issue.skills.length > 4 && (
              <span
                className="text-2xs"
                style={{ color: "var(--color-muted)" }}
              >
                +{issue.skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* ── Row 5: Match explanation ──────────────────────────── */}
        {issue.matchExplanation && (
          <div
            style={{
              borderRadius: "var(--radius)",
              padding: "0.625rem 0.75rem",
              backgroundColor: hovered
                ? "rgba(184,243,107,0.06)"
                : "var(--color-elevated)",
              borderLeft: "2px solid var(--color-accent)",
              transition: "background-color 400ms ease",
              position: "relative",
              zIndex: 1,
            }}
          >
            <p
              style={{
                fontSize: "var(--text-xs)",
                lineHeight: 1.6,
                color: hovered
                  ? "var(--color-primary)"
                  : "var(--color-secondary)",
                transition: "color 300ms ease",
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  color: "var(--color-accent)",
                  marginRight: "0.25rem",
                }}
              >
                Why this matches:
              </span>
              {issue.matchExplanation}
            </p>
          </div>
        )}

        {/* ── Row 6: Actions ───────────────────────────────────── */}
        <div className="flow-card-actions">

          {/* Primary: View Details — full FlowButton */}
          <button
            onClick={handleViewDetails} // ← was: onClick={() => onViewDetails?.(issue)}
            className="flow-btn flow-btn-primary"
            aria-label={`View details for "${issue.title}"`}
            style={{ flex: 1, position: "relative", zIndex: 2 }}
          >
            <ArrowRight className="flow-btn-arrow-left" aria-hidden="true" />
            <span className="flow-btn-label">View Details</span>
            <span className="flow-btn-circle" aria-hidden="true" />
            <ArrowRight className="flow-btn-arrow-right" aria-hidden="true" />
          </button>

          {/* Secondary: Open on GitHub */}
          <Link
            href={issue.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open issue #${issue.issueNumber} on GitHub`}
            className="flow-btn flow-btn-secondary"
            style={{
              flexShrink: 0,
              textDecoration: "none",
              position: "relative",
              zIndex: 2,
            }}
          >
            <ExternalLink
              size={12}
              strokeWidth={2}
              aria-hidden="true"
              style={{ position: "relative", zIndex: 1 }}
            />
            <span className="flow-btn-label">GitHub</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
