// components/ui/SkillTag.tsx
import type { SkillLevel } from "@/types";

interface SkillTagProps {
  name: string;
  level?: SkillLevel;
  variant?: "default" | "suggested" | "compact";
  onDelete?: () => void;
}

const levelConfig: Record<SkillLevel, { label: string; color: string }> = {
  learning:   { label: "Learning",   color: "var(--color-muted)"   },
  familiar:   { label: "Familiar",   color: "var(--color-warning)" },
  proficient: { label: "Proficient", color: "var(--color-accent)"  },
  expert:     { label: "Expert",     color: "var(--color-info)"    },
};

export function SkillTag({ name, level, variant = "default", onDelete }: SkillTagProps) {

  if (variant === "compact") {
    return (
      <span className="skill-pill">
        {name}
      </span>
    );
  }

  if (variant === "suggested") {
    return (
      <span
        style={{
          display:         "inline-flex",
          alignItems:      "center",
          gap:             "0.375rem",
          padding:         "0.25rem 0.625rem",
          fontSize:        "var(--text-xs)",
          fontWeight:      500,
          borderRadius:    "var(--radius-sm)",
          backgroundColor: "var(--color-accent-muted)",
          color:           "var(--color-accent)",
          border:          "1px solid rgba(184,243,107,0.2)",
        }}
      >
        <span aria-hidden="true" style={{ fontSize: "0.75rem", lineHeight: 1 }}>+</span>
        {name}
      </span>
    );
  }

  // default — with level indicator + optional delete button
  const lc = level ? levelConfig[level] : null;

  return (
    <span
      style={{
        display:         "inline-flex",
        alignItems:      "center",
        gap:             "0.5rem",
        padding:         "0.375rem 0.75rem",
        fontSize:        "var(--text-sm)",
        fontWeight:      500,
        borderRadius:    "var(--radius)",
        backgroundColor: "var(--color-card)",
        color:           "var(--color-primary)",
        border:          "1px solid var(--color-subtle)",
      }}
    >
      {name}
      {lc && (
        <span
          style={{
            fontSize:   "var(--text-xs)",
            fontWeight: 400,
            color:      lc.color,
          }}
        >
          {lc.label}
        </span>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          aria-label={`Remove ${name}`}
          style={{
            display:      "inline-flex",
            alignItems:   "center",
            justifyContent: "center",
            marginLeft:   "0.125rem",
            padding:      "0 0.125rem",
            fontSize:     "0.75rem",
            lineHeight:   1,
            color:        "var(--color-muted)",
            background:   "none",
            border:       "none",
            cursor:       "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-muted)")}
        >
          ✕
        </button>
      )}
    </span>
  );
}
