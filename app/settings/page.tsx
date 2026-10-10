// app/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Save, Check } from "lucide-react";
import type { UserProfile } from "@/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";

const EXPERIENCE_OPTIONS: {
  value: UserProfile["experienceLevel"];
  label: string;
  desc: string;
}[] = [
  {
    value: "complete-beginner",
    label: "Complete Beginner",
    desc: "I'm new to programming and open source.",
  },
  {
    value: "some-experience",
    label: "Some Experience",
    desc: "I've built personal projects and understand the basics.",
  },
  {
    value: "comfortable",
    label: "Comfortable",
    desc: "I've contributed before and understand PR workflows.",
  },
];

const LANGUAGE_OPTIONS = [
  "JavaScript", "TypeScript", "Python", "Rust", "Go",
  "Java", "C#", "Ruby", "PHP", "CSS / HTML",
];

export default function SettingsPage() {
  const { user, name, githubHandle, loading } = useUser();

  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    githubHandle: "",
    avatarInitials: "",
    experienceLevel: "some-experience",
    languages: [],
  });

  const [saved, setSaved]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  // ── Load profile from Supabase on mount ──────────────────────
  useEffect(() => {
    if (!user || loading) return;

    const supabase = createClient();

    async function fetchProfile() {
  setFetching(true);

  const { data, error } = await supabase
    .from("user_profiles")
    .select("experience_level, languages, display_name, github_handle")
    .eq("user_id", user!.id)
    .single();

  console.log("profile fetch →", { data, error }); // ← temporary debug

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found (first visit), that's fine
    setError("Failed to load settings.");
    setFetching(false);
    return;
  }

  const displayName = data?.display_name ?? name ?? "";

  setProfile({
    name:            displayName,
    githubHandle:    data?.github_handle ?? githubHandle ?? "",
    avatarInitials:  displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2),
    experienceLevel: data?.experience_level ?? "some-experience",
    languages:       data?.languages ?? [],
  });

  setFetching(false);
}

    fetchProfile();
  }, [user, loading, name, githubHandle]);

  // ── Toggle language ───────────────────────────────────────────
  const toggleLanguage = (lang: string) => {
    setProfile((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  // ── Save to Supabase ──────────────────────────────────────────
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();

    const { error } = await supabase
      .from("user_profiles")
      .upsert(
        {
          user_id:          user.id,
          display_name:     profile.name,
          github_handle:    profile.githubHandle,
          experience_level: profile.experienceLevel,
          languages:        profile.languages,
          updated_at:       new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      setError("Failed to save settings. Please try again.");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }

    setSaving(false);
  };

  if (fetching) {
    return (
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        Loading settings…
      </p>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Error banner */}
      {error && (
        <p
          className="text-xs px-3 py-2 rounded"
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

      {/* Profile */}
      <section
        className="rounded-lg p-5"
        style={{
          backgroundColor: "var(--bg-panel)",
          border: "1px solid var(--border)",
        }}
      >
        <SectionHeader title="Profile" />
        <div className="space-y-4">
          <Field label="Display name">
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded outline-none"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) =>
                ((e.currentTarget as HTMLInputElement).style.borderColor = "var(--accent)")
              }
              onBlur={(e) =>
                ((e.currentTarget as HTMLInputElement).style.borderColor = "var(--border)")
              }
            />
          </Field>

          <Field label="GitHub handle">
            <div
              className="flex items-center rounded overflow-hidden"
              style={{ border: "1px solid var(--border)" }}
            >
              <span
                className="px-3 py-2 text-sm select-none"
                style={{
                  backgroundColor: "var(--bg-hover)",
                  color: "var(--text-muted)",
                  borderRight: "1px solid var(--border)",
                }}
              >
                github.com/
              </span>
              <input
                type="text"
                value={profile.githubHandle}
                onChange={(e) =>
                  setProfile({ ...profile, githubHandle: e.target.value })
                }
                className="flex-1 px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: "var(--bg-card)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </Field>
        </div>
      </section>

      {/* Experience level */}
      <section
        className="rounded-lg p-5"
        style={{
          backgroundColor: "var(--bg-panel)",
          border: "1px solid var(--border)",
        }}
      >
        <SectionHeader
          title="Experience Level"
          subtitle="Helps RepoReady recommend appropriate issues"
        />
        <div className="space-y-2.5">
          {EXPERIENCE_OPTIONS.map((opt) => {
            const selected = profile.experienceLevel === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setProfile({ ...profile, experienceLevel: opt.value })}
                className="w-full flex items-start gap-3 rounded-lg p-3 text-left transition-colors duration-150"
                style={{
                  backgroundColor: selected ? "rgba(163, 230, 53, 0.06)" : "var(--bg-card)",
                  border: selected
                    ? "1px solid rgba(163, 230, 53, 0.3)"
                    : "1px solid var(--border)",
                }}
              >
                <div
                  className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{
                    border: selected
                      ? "2px solid var(--accent)"
                      : "2px solid var(--text-muted)",
                  }}
                >
                  {selected && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: "var(--accent)" }}
                    />
                  )}
                </div>
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: selected ? "var(--accent)" : "var(--text-primary)" }}
                  >
                    {opt.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {opt.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Languages */}
      <section
        className="rounded-lg p-5"
        style={{
          backgroundColor: "var(--bg-panel)",
          border: "1px solid var(--border)",
        }}
      >
        <SectionHeader
          title="Languages & Technologies"
          subtitle="Select all that you're comfortable working with"
        />
        <div className="flex flex-wrap gap-2">
          {LANGUAGE_OPTIONS.map((lang) => {
            const active = profile.languages.includes(lang);
            return (
              <button
                key={lang}
                onClick={() => toggleLanguage(lang)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors duration-150"
                style={{
                  backgroundColor: active ? "rgba(163, 230, 53, 0.1)" : "var(--bg-card)",
                  color: active ? "var(--accent)" : "var(--text-secondary)",
                  border: active
                    ? "1px solid rgba(163, 230, 53, 0.3)"
                    : "1px solid var(--border)",
                }}
              >
                {active && <Check className="w-3 h-3" />}
                {lang}
              </button>
            );
          })}
        </div>
      </section>

      {/* Save */}
      <div className="flex justify-end pb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded transition-colors duration-150"
          style={{
            backgroundColor: saved ? "rgba(163, 230, 53, 0.15)" : "var(--accent)",
            color: saved ? "var(--accent)" : "#0f0f0f",
            border: saved ? "1px solid rgba(163, 230, 53, 0.3)" : "none",
            opacity: saving ? 0.6 : 1,
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saved ? (
            <><Check className="w-4 h-4" />Saved</>
          ) : saving ? (
            <><Save className="w-4 h-4" />Saving…</>
          ) : (
            <><Save className="w-4 h-4" />Save preferences</>
          )}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="block text-xs font-medium mb-1.5"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
