
"use client";

import { useState } from "react";
import { GitBranch, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function GitHubLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signIn() {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
   } catch (err) {
  console.error("GitHub sign-in failed:", err);

  setError(
    err instanceof Error
      ? err.message
      : "Unknown sign-in error. Check the browser console."
  );

  setLoading(false);
}
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={signIn}
        disabled={loading}
        onKeyDown={undefined}
        className="flex w-full items-center justify-center gap-3 rounded-lg px-4 py-3 font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
        style={{ backgroundColor: "var(--accent)", color: "#101010" }}
      >
        {loading ? (
          <LoaderCircle className="h-5 w-5 animate-spin" />
        ) : (
          <GitBranch className="h-5 w-5" />
        )}
        {loading ? "Connecting..." : "Continue with GitHub"}
      </button>

      {error && (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}