// app/skills/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { suggestedSkills } from "@/lib/demo-data";
import { SkillTag } from "@/components/ui/SkillTag";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import type { Skill, SkillLevel } from "@/types";

const LEVEL_ORDER: SkillLevel[] = ["expert", "proficient", "familiar", "learning"];

const LEVEL_META: Record<SkillLevel, { label: string; desc: string; color: string }> = {
  expert:     { label: "Expert",     desc: "Deep, production-level knowledge",   color: "#38bdf8" },
  proficient: { label: "Proficient", desc: "Comfortable and independent",         color: "#a3e635" },
  familiar:   { label: "Familiar",   desc: "Used it, need occasional reference", color: "#fbbf24" },
  learning:   { label: "Learning",   desc: "Actively studying or practising",    color: "#8a8a8a" },
};

export default function SkillsPage() {
  const { user } = useUser();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newLevel, setNewLevel] = useState<SkillLevel>("learning");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch user's current skills ─────────────────────────────
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    async function fetchSkills() {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_skills")
        .select("name, level")
        .eq("user_id", user!.id)
        .order("name");

      if (error) {
        setError("Failed to load skills.");
      } else {
        setSkills((data ?? []) as Skill[]);
      }
      setLoading(false);
    }

    fetchSkills();
  }, [user]);

  // ── Fetch master skills list for dropdown ───────────────────
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("skills")
      .select("name")
      .order("name")
      .then(({ data }) => {
        setAvailableSkills((data ?? []).map((r) => r.name));
      });
  }, []);

  // ── Add skill ───────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newSkill.trim() || !user) return;

    const skill: Skill = { name: newSkill.trim(), level: newLevel };

    // Optimistic update
    setSkills((prev) => [...prev, skill]);
    setNewSkill("");
    setNewLevel("learning");
    setShowAddForm(false);
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("user_skills")
      .upsert(
        { user_id: user.id, name: skill.name, level: skill.level },
        { onConflict: "user_id,name" }
      );

    if (error) {
      setSkills((prev) => prev.filter((s) => s.name !== skill.name));
      setError("Failed to save skill. Please try again.");
    }

    setSaving(false);
  };

  // ── Delete skill ────────────────────────────────────────────
  const handleDelete = async (name: string) => {
    if (!user) return;

    setSkills((prev) => prev.filter((s) => s.name !== name));

    const supabase = createClient();
    const { error } = await supabase
      .from("user_skills")
      .delete()
      .eq("user_id", user.id)
      .eq("name", name);

    if (error) {
      setError("Failed to delete skill.");
    }
  };

  const grouped = LEVEL_ORDER.map((level) => ({
    level,
    skills: skills.filter((s) => s.level === level),
  })).filter((g) => g.skills.length > 0);

  return (
    <div className="max-w-3xl mx-auto">

      {/* Error banner */}
      {error && (
        <p
          className="text-xs mb-4 px-3 py-2 rounded"
          style={{
            color: "#f87171",
            backgroundColor: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.2)",
          }}
        >
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>
            Dismiss
          </button>
        </p>
      )}

      {/* Current skills */}
      <section
        className="rounded-lg p-5 mb-6"
        style={{
          backgroundColor: "var(--bg-panel)",
          border: "1px solid var(--border)",
        }}
      >
        <SectionHeader
          title="My Skills"
          action={
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-colors duration-150"
              style={{
                backgroundColor: showAddForm ? "var(--bg-hover)" : "transparent",
                color: "var(--accent)",
                border: "1px solid rgba(163, 230, 53, 0.3)",
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              {saving ? "Saving…" : "Add skill"}
            </button>
          }
        />

        {/* Add form */}
        {showAddForm && (
          <div
            className="flex flex-col sm:flex-row gap-3 mb-5 p-3 rounded"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Dropdown instead of free text */}
            <select
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="flex-1 px-3 py-2 text-sm rounded outline-none"
              style={{
                backgroundColor: "var(--bg-hover)",
                border: "1px solid var(--border)",
                color: newSkill ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              <option value="">Select a skill…</option>
              {availableSkills
                .filter((s) => !skills.some((us) => us.name === s)) // hide already-added
                .map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
            </select>

            <select
              value={newLevel}
              onChange={(e) => setNewLevel(e.target.value as SkillLevel)}
              className="px-3 py-2 text-sm rounded outline-none"
              style={{
                backgroundColor: "var(--bg-hover)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            >
              {LEVEL_ORDER.map((l) => (
                <option key={l} value={l}>
                  {LEVEL_META[l].label}
                </option>
              ))}
            </select>

            <button
              onClick={handleAdd}
              disabled={!newSkill}
              className="px-4 py-2 text-xs font-semibold rounded"
              style={{
                backgroundColor: newSkill ? "var(--accent)" : "var(--bg-hover)",
                color: newSkill ? "#0f0f0f" : "var(--text-muted)",
                cursor: newSkill ? "pointer" : "not-allowed",
              }}
            >
              Add
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Loading skills…
          </p>
        )}

        {/* Empty state */}
        {!loading && skills.length === 0 && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            No skills yet — add your first one above.
          </p>
        )}

        {/* Grouped skill display */}
        {!loading && (
          <div className="space-y-5">
            {grouped.map(({ level, skills: groupSkills }) => {
              const meta = LEVEL_META[level];
              return (
                <div key={level}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span className="text-xs font-semibold" style={{ color: meta.color }}>
                      {meta.label}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      — {meta.desc}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {groupSkills.map((skill) => (
                      <SkillTag
                        key={skill.name}
                        name={skill.name}
                        level={skill.level}
                        onDelete={() => handleDelete(skill.name)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Suggested skills */}
      <section
        className="rounded-lg p-5"
        style={{
          backgroundColor: "var(--bg-panel)",
          border: "1px solid var(--border)",
        }}
      >
        <SectionHeader
          title="Suggested Skills to Learn"
          subtitle="Based on common open-source contribution patterns"
        />
        <div className="flex flex-wrap gap-2">
          {suggestedSkills.map((skill) => (
            <SkillTag key={skill} name={skill} variant="suggested" />
          ))}
        </div>
      </section>
    </div>
  );
}
