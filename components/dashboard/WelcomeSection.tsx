// components/dashboard/WelcomeSection.tsx
"use client";

import { useState } from "react";
import { Search, AlertCircle, CheckCircle2, Loader2, ArrowRight } from "lucide-react";

type AnalyzerState = "idle" | "loading" | "success" | "error";

function isValidGithubUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    return (
      parsed.hostname === "github.com" &&
      parsed.pathname.split("/").filter(Boolean).length >= 2
    );
  } catch {
    return false;
  }
}

export function WelcomeSection() {
  const [url, setUrl] = useState("");
  const [analyzerState, setAnalyzerState] = useState<AnalyzerState>("idle");
  const [validationError, setValidationError] = useState("");

  const handleAnalyze = () => {
    setValidationError("");

    if (!url.trim()) {
      setValidationError("Please enter a GitHub repository URL.");
      return;
    }
    if (!isValidGithubUrl(url)) {
      setValidationError(
        "Enter a valid GitHub repository URL, e.g. https://github.com/owner/repo"
      );
      return;
    }

    // Simulate analysis — no API connected
    setAnalyzerState("loading");
    setTimeout(() => {
      setAnalyzerState("success");
    }, 1800);
  };

  const handleReset = () => {
    setUrl("");
    setAnalyzerState("idle");
    setValidationError("");
  };

  return (
    <section className="mb-8">
      {/* Heading */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          Ready to make your next contribution?
        </h1>
        <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
          RepoReady analyzes open-source repositories to surface issues that match your skill
          level, explains what each contribution requires, and builds you a step-by-step plan.
        </p>
      </div>

      {/* Repository analyzer */}
      <div
        className="rounded-lg p-5"
        style={{
          backgroundColor: "var(--bg-panel)",
          border: "1px solid var(--border)",
        }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "var(--text-muted)" }}
        >
          Repository Analyzer
        </p>

        {analyzerState === "success" ? (
          <SuccessState url={url} onReset={handleReset} />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Input */}
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (validationError) setValidationError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  placeholder="Paste a GitHub repository URL..."
                  disabled={analyzerState === "loading"}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded outline-none transition-colors duration-150 disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    border: validationError
                      ? "1px solid #ef4444"
                      : "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => {
                    if (!validationError)
                      (e.currentTarget as HTMLInputElement).style.borderColor =
                        "var(--accent)";
                  }}
                  onBlur={(e) => {
                    if (!validationError)
                      (e.currentTarget as HTMLInputElement).style.borderColor =
                        "var(--border)";
                  }}
                />
              </div>

              {/* Button */}
              <button
                onClick={handleAnalyze}
                disabled={analyzerState === "loading"}
                className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded transition-opacity duration-150 disabled:opacity-60 flex-shrink-0"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "#0f0f0f",
                }}
                onMouseEnter={(e) => {
                  if (analyzerState !== "loading")
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      "var(--accent-dim)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "var(--accent)";
                }}
              >
                {analyzerState === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    Analyze Repository
                  </>
                )}
              </button>
            </div>

            {/* Validation error */}
            {validationError && (
              <div className="flex items-center gap-2 mt-2.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#ef4444" }} />
                <p className="text-xs" style={{ color: "#ef4444" }}>
                  {validationError}
                </p>
              </div>
            )}

            {analyzerState === "loading" && (
              <p className="text-xs mt-2.5" style={{ color: "var(--text-muted)" }}>
                Scanning repository structure and open issues… (demo — no API connected)
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function SuccessState({ url, onReset }: { url: string; onReset: () => void }) {
  const repoPath = (() => {
    try {
      return new URL(url).pathname.slice(1);
    } catch {
      return url;
    }
  })();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex items-center gap-3 flex-1">
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "var(--accent)" }} />
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            {repoPath}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Analysis complete (demo — Gemini API not yet connected). Scroll down to see matched issues.
          </p>
        </div>
      </div>
      <button
        onClick={onReset}
        className="text-xs px-3 py-1.5 rounded transition-colors duration-150 flex-shrink-0"
        style={{
          color: "var(--text-secondary)",
          border: "1px solid var(--border)",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)")
        }
      >
        Analyze another
      </button>
    </div>
  );
}
