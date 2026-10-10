// components/layout/Header.tsx
"use client";

import { usePathname } from "next/navigation";
import { Bell, GitBranch } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const PAGE_META: Record<string, { title: string; description: string }> = {
  "/":             { title: "Dashboard",            description: "Your contribution overview"          },
  "/discover":     { title: "Discover Issues",      description: "Find issues that match your skills"  },
  "/skills":       { title: "My Skills",            description: "Manage your skill profile"           },
  "/roadmap":      { title: "Contribution Roadmap", description: "Step-by-step contribution plan"      },
  "/achievements": { title: "Achievements",         description: "Track your milestones"               },
  "/settings":     { title: "Settings",             description: "Profile and preferences"             },
};

export function Header() {
  const pathname = usePathname();
  const meta = PAGE_META[pathname] ?? { title: "RepoReady", description: "" };
  const [bellHover, setBellHover] = useState(false);
  const [profileHover, setProfileHover] = useState(false);

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
        height: "var(--header-height)",
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-subtle)",
        flexShrink: 0,
        gap: "1rem",
      }}
    >
      {/* ── Left: page identity ──────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.875rem",
          minWidth: 0,
        }}
      >
        {/* Mobile spacer so title doesn't overlap hamburger */}
        <div
          className="lg:hidden"
          style={{ width: "36px", flexShrink: 0 }}
          aria-hidden="true"
        />

        {/* Vertical rule — desktop only */}
        <div
          className="hidden lg:block"
          style={{
            width: "1px",
            height: "18px",
            backgroundColor: "var(--color-subtle)",
            flexShrink: 0,
          }}
        />

        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "var(--color-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              letterSpacing: "-0.01em",
            }}
          >
            {meta.title}
          </h1>
          {meta.description && (
            <p
              className="hidden sm:block text-2xs"
              style={{
                color: "var(--color-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                marginTop: "1px",
              }}
            >
              {meta.description}
            </p>
          )}
        </div>
      </div>

      {/* ── Right: actions ───────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.375rem",
          flexShrink: 0,
        }}
      >
        {/* API status pill — honest, not connected */}
        <div
          className="hidden md:flex"
          style={{
            alignItems: "center",
            gap: "0.375rem",
            padding: "0.25rem 0.625rem",
            borderRadius: "var(--radius)",
            border: "1px solid var(--color-subtle)",
            marginRight: "0.5rem",
          }}
        >
          <GitBranch size={10} style={{ color: "var(--color-muted)" }} />
          <span
            className="text-2xs"
            style={{ color: "var(--color-muted)", fontWeight: 500 }}
          >
            GitHub API · not connected
          </span>
        </div>

        {/* Notification bell */}
        <button
          onMouseEnter={() => setBellHover(true)}
          onMouseLeave={() => setBellHover(false)}
          aria-label="Notifications"
          style={{
            position: "relative",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "var(--radius)",
            border: bellHover ? "1px solid var(--color-subtle)" : "1px solid transparent",
            backgroundColor: bellHover ? "var(--color-elevated)" : "transparent",
            color: bellHover ? "var(--color-primary)" : "var(--color-muted)",
            transition: "color 150ms ease, background-color 150ms ease, border-color 150ms ease",
          }}
        >
          <Bell size={15} />
          {/* Accent dot */}
          <span
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              width: "5px",
              height: "5px",
              borderRadius: "9999px",
              backgroundColor: "var(--color-accent)",
              boxShadow: "0 0 5px rgba(184,243,107,0.6)",
            }}
          />
        </button>

        {/* Profile pill — links to settings */}
        <Link
          href="/settings"
          aria-label="Open settings"
          onMouseEnter={() => setProfileHover(true)}
          onMouseLeave={() => setProfileHover(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.25rem 0.625rem 0.25rem 0.25rem",
            borderRadius: "var(--radius-full)",
            border: `1px solid ${profileHover ? "var(--color-accent)" : "var(--color-subtle)"}`,
            backgroundColor: profileHover ? "var(--color-elevated)" : "transparent",
            textDecoration: "none",
            transition: "border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease",
            ...(profileHover && {
              boxShadow: "0 0 0 1px rgba(184,243,107,0.15), 0 0 8px rgba(184,243,107,0.08)",
            }),
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "9999px",
              backgroundColor: "var(--color-accent-muted)",
              border: "1px solid rgba(184,243,107,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              className="text-2xs"
              style={{ fontWeight: 700, color: "var(--color-accent)" }}
            >
              AD
            </span>
          </div>

          <span
            className="hidden sm:block"
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: 500,
              color: profileHover ? "var(--color-primary)" : "var(--color-secondary)",
              transition: "color 150ms ease",
            }}
          >
            alexdev
          </span>
        </Link>
      </div>
    </header>
  );
}
