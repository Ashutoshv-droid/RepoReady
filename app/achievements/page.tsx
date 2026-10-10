// app/achievements/page.tsx
import { Star, Lock } from "lucide-react";
import { demoAchievements } from "@/lib/demo-data";

const categoryLabel: Record<string, string> = {
  contribution: "Contributions",
  learning:     "Learning",
  community:    "Community",
  milestone:    "Milestones",
};

const categoryOrder = ["contribution", "milestone", "learning", "community"];

export default function AchievementsPage() {
  const earned = demoAchievements.filter((a) => a.earned).length;
  const total  = demoAchievements.length;

  const grouped = categoryOrder.map((cat) => ({
    category: cat,
    items: demoAchievements.filter((a) => a.category === cat),
  }));

  return (
    <div className="max-w-3xl mx-auto">
      {/* Summary */}
      <div
        className="rounded-lg p-5 mb-6 flex items-center gap-5"
        style={{
          backgroundColor: "var(--bg-panel)",
          border: "1px solid var(--border)",
        }}
      >
        <div
          className="flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0"
          style={{ backgroundColor: "rgba(163, 230, 53, 0.1)" }}
        >
          <Star className="w-6 h-6" style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            {earned}{" "}
            <span className="text-sm font-normal" style={{ color: "var(--text-secondary)" }}>
              / {total} earned
            </span>
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Demo achievements — keep contributing to unlock the rest.
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex-1 hidden sm:block">
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: "var(--bg-hover)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.round((earned / total) * 100)}%`,
                backgroundColor: "var(--accent)",
              }}
            />
          </div>
          <p className="text-xs mt-1 text-right" style={{ color: "var(--text-muted)" }}>
            {Math.round((earned / total) * 100)}% complete
          </p>
        </div>
      </div>

      {/* By category */}
      <div className="space-y-8">
        {grouped.map(({ category, items }) => (
          <section key={category}>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              {categoryLabel[category]}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((ach) => (
                <div
                  key={ach.id}
                  className="flex items-start gap-4 rounded-lg p-4 transition-opacity duration-150"
                  style={{
                    backgroundColor: "var(--bg-panel)",
                    border: ach.earned
                      ? "1px solid rgba(163, 230, 53, 0.2)"
                      : "1px solid var(--border)",
                    opacity: ach.earned ? 1 : 0.5,
                  }}
                >
                  {/* Icon */}
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 text-xl"
                    style={{
                      backgroundColor: ach.earned
                        ? "rgba(163, 230, 53, 0.1)"
                        : "var(--bg-hover)",
                    }}
                  >
                    {ach.earned ? (
                      ach.icon
                    ) : (
                      <Lock className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {ach.title}
                      </p>
                      {ach.earned && (
                        <Star
                          className="w-3.5 h-3.5 flex-shrink-0"
                          style={{ color: "var(--accent)" }}
                        />
                      )}
                    </div>
                    <p
                      className="text-xs mt-1 leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {ach.description}
                    </p>
                    {ach.earned && ach.earnedDate && (
                      <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                        Earned{" "}
                        {new Date(ach.earnedDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
