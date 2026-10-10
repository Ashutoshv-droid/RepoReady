// components/ui/DifficultyBadge.tsx
import type { Difficulty } from "@/types";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  size?: "sm" | "md";
}

const CONFIG: Record<
  Difficulty,
  { label: string; color: string; bg: string; border: string; glow: string }
> = {
  beginner: {
    label:  "Beginner",
    color:  "#B8F36B",
    bg:     "rgba(184,243,107,0.07)",
    border: "rgba(184,243,107,0.2)",
    glow:   "rgba(184,243,107,0.45)",
  },
  intermediate: {
    label:  "Intermediate",
    color:  "#FBBF24",
    bg:     "rgba(251,191,36,0.07)",
    border: "rgba(251,191,36,0.2)",
    glow:   "rgba(251,191,36,0.45)",
  },
  advanced: {
    label:  "Advanced",
    color:  "#F87171",
    bg:     "rgba(248,113,113,0.07)",
    border: "rgba(248,113,113,0.2)",
    glow:   "rgba(248,113,113,0.45)",
  },
};

export function DifficultyBadge({ difficulty, size = "sm" }: DifficultyBadgeProps) {
  const c = CONFIG[difficulty];
  const padding = size === "md" ? "0.25rem 0.625rem" : "0.1875rem 0.5rem";

  return (
    <span
      style={{
        display:         "inline-flex",
        alignItems:      "center",
        gap:             "0.375rem",
        padding,
        borderRadius:    "4px",
        fontSize:        "0.6875rem",
        fontWeight:      600,
        lineHeight:      1.4,
        color:           c.color,
        backgroundColor: c.bg,
        border:          `1px solid ${c.border}`,
        whiteSpace:      "nowrap",
      }}
    >
      <span
        style={{
          width:           "5px",
          height:          "5px",
          borderRadius:    "9999px",
          backgroundColor: c.color,
          flexShrink:      0,
          boxShadow:       `0 0 4px ${c.glow}`,
          animation:
            difficulty === "beginner" ? "pulse-slow 3s cubic-bezier(0.4,0,0.6,1) infinite" : undefined,
        }}
        aria-hidden="true"
      />
      {c.label}
    </span>
  );
}
