// components/dashboard/ProgressSection.tsx
import { ArrowRight, Star, Lock } from "lucide-react";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useProgress } from "@/hooks/useProgress";

const levelOrder: Record<string, number> = {
  learning: 1,
  familiar: 2,
  proficient: 3,
  expert: 4,
};

const levelBarWidth: Record<string, string> = {
  learning: "25%",
  familiar: "50%",
  proficient: "75%",
  expert: "100%",
};

const levelColor: Record<string, string> = {
  learning: "#8a8a8a",
  familiar: "#fbbf24",
  proficient: "#a3e635",
  expert: "#38bdf8",
};

export function ProgressSection() {
  const { skills, achievements, earnedCount, totalCount } = useProgress();

  const topSkills = [...skills]
    .sort((a, b) => levelOrder[b.level] - levelOrder[a.level])
    .slice(0, 4);

  const previewAchievements = achievements.slice(0, 4);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Skill progress */}
      <div
        className="rounded-lg p-5"
        style={{
          backgroundColor: "var(--bg-panel)",
          border: "1px solid var(--border)",
        }}
      >
        <SectionHeader
          title="Skill Progress"
          action={
            <Link
              href="/skills"
              className="flex items-center gap-1 text-xs transition-colors duration-150"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)")
              }
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          }
        />

        <div className="space-y-4">
          {topSkills.map((skill) => (
            <div key={skill.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {skill.name}
                </span>
                <span
                  className="text-xs capitalize"
                  style={{ color: levelColor[skill.level] }}
                >
                  {skill.level}
                </span>
              </div>
              <div
                className="w-full h-1 rounded-full overflow-hidden"
                style={{ backgroundColor: "var(--bg-hover)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: levelBarWidth[skill.level],
                    backgroundColor: levelColor[skill.level],
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Suggested next step */}
        <div
          className="mt-5 rounded p-3"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <p
            className="text-xs font-semibold mb-1"
            style={{ color: "var(--text-secondary)" }}
          >
            Suggested next step
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Practice Git branching workflows — it's the most common blocker
            for first-time contributors.
          </p>
        </div>
      </div>

      {/* Achievement preview */}
      <div
        className="rounded-lg p-5"
        style={{
          backgroundColor: "var(--bg-panel)",
          border: "1px solid var(--border)",
        }}
      >
        <SectionHeader
          title="Achievements"
          subtitle={`${earnedCount} of ${totalCount} earned`}
          action={
            <Link
              href="/achievements"
              className="flex items-center gap-1 text-xs transition-colors duration-150"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)")
              }
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          }
        />

        <div className="grid grid-cols-2 gap-3">
          {previewAchievements.map((ach) => (
            <div
              key={ach.id}
              className="flex items-start gap-3 rounded p-3"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
                opacity: ach.earned ? 1 : 0.45,
              }}
            >
              <span className="text-xl leading-none flex-shrink-0">
                {ach.icon}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p
                    className="text-xs font-semibold truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {ach.title}
                  </p>
                  {!ach.earned && (
                    <Lock
                      className="w-3 h-3 flex-shrink-0"
                      style={{ color: "var(--text-muted)" }}
                    />
                  )}
                  {ach.earned && (
                    <Star
                      className="w-3 h-3 flex-shrink-0"
                      style={{ color: "var(--accent)" }}
                    />
                  )}
                </div>
                <p
                  className="text-xs mt-0.5 leading-snug"
                  style={{ color: "var(--text-muted)" }}
                >
                  {ach.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
