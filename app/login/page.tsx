import { GitBranch } from "lucide-react";
import { GitHubLoginButton } from "@/components/auth/GitHubLoginButton";

export default function LoginPage() {
  return (
    <div
      className="flex min-h-screen w-full items-center justify-center p-6"
      style={{ backgroundColor: "var(--color-base)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-8 sm:p-10"
        style={{
          backgroundColor: "var(--bg-panel)",
          borderColor: "var(--border)",
        }}
      >
        <div className="mb-8 flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: "var(--accent)", color: "#101010" }}
          >
            <GitBranch className="h-6 w-6" />
          </div>

          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              RepoReady
            </h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Open source, made approachable.
            </p>
          </div>
        </div>

        <h2
          className="text-2xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Find your next contribution.
        </h2>

        <p
          className="mt-3 mb-7 text-sm leading-6"
          style={{ color: "var(--text-secondary)" }}
        >
          Sign in to build your developer profile and discover open-source
          issues that match your skills.
        </p>

        <GitHubLoginButton />

        <p
          className="mt-6 text-center text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          Continue securely with your GitHub account.
        </p>
      </div>
    </div>
  );
}
