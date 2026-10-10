// components/dashboard/StatsCards.tsx
import { Eye, GitPullRequest, Zap, TrendingUp } from "lucide-react";
import { useUser } from "@/hooks/useUser";

export function StatsCards() {
  const { stats } = useUser();

  const cards = [
    {
      label: "Issues Explored",
      key: "issuesExplored" as const,
      icon: Eye,
      description: "Issues reviewed",
      accentColor: "var(--accent)",
    },
    {
      label: "Contributions Completed",
      key: "contributionsCompleted" as const,
      icon: GitPullRequest,
      description: "PRs merged or closed",
      accentColor: "#38bdf8",
    },
    {
      label: "Skills in Progress",
      key: "skillsInProgress" as const,
      icon: Zap,
      description: "Active skill tracks",
      accentColor: "#fbbf24",
    },
    {
      label: "Current Level",
      key: "currentLevel" as const,
      icon: TrendingUp,
      description: `${stats.totalXP} XP earned`,
      accentColor: "#a78bfa",
    },
  ];

  return (
    <section className="mb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(({ label, key, icon: Icon, description, accentColor }) => {
          const value = stats[key];

          return (
            <div
              key={key}
              className="rounded-lg p-4"
              style={{
                backgroundColor: "var(--bg-panel)",
                border: "1px solid var(--border)",
              }}
            >
              {/* Icon */}
              <div
                className="inline-flex items-center justify-center w-8 h-8 rounded mb-3"
                style={{ backgroundColor: "var(--bg-hover)" }}
              >
                <Icon className="w-4 h-4" style={{ color: accentColor }} />
              </div>

              {/* Value */}
              <p
                className="text-2xl font-bold tabular-nums"
                style={{ color: "var(--text-primary)" }}
              >
                {value}
              </p>

              {/* Label */}
              <p className="text-xs font-medium mt-0.5" style={{ color: "var(--text-secondary)" }}>
                {label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
