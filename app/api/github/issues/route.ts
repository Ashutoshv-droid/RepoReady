
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const repoUrl = request.nextUrl.searchParams.get("url");

  if (!repoUrl) {
    return NextResponse.json(
      { error: "Please provide a GitHub repository URL." },
      { status: 400 }
    );
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(repoUrl);
  } catch {
    return NextResponse.json(
      { error: "Invalid repository URL." },
      { status: 400 }
    );
  }

  if (
    parsedUrl.hostname !== "github.com" ||
    parsedUrl.protocol !== "https:"
  ) {
    return NextResponse.json(
      { error: "Please provide a valid github.com URL." },
      { status: 400 }
    );
  }

  const parts = parsedUrl.pathname.split("/").filter(Boolean);

  if (
    parts.length !== 2 ||
    !parts.every((part) => /^[a-zA-Z0-9._-]+$/.test(part)) ||
    parts.some((part) => part === "." || part === "..")
  ) {
    return NextResponse.json(
      { error: "Use a URL like https://github.com/owner/repository." },
      { status: 400 }
    );
  }

  const [owner, repo] = parts;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  // Optional: increases the GitHub API rate limit.
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const baseUrl =
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

    const [repoResponse, issuesResponse] = await Promise.all([
      fetch(baseUrl, { headers, cache: "no-store" }),
      fetch(
        `${baseUrl}/issues?state=open&per_page=30&sort=updated&direction=desc`,
        { headers, cache: "no-store" }
      ),
    ]);

    if (!repoResponse.ok || !issuesResponse.ok) {
      const response = !repoResponse.ok ? repoResponse : issuesResponse;

      if (response.status === 404) {
        return NextResponse.json(
          { error: "Repository not found or not publicly accessible." },
          { status: 404 }
        );
      }

      if (response.status === 403 || response.status === 429) {
        return NextResponse.json(
          { error: "GitHub API rate limit reached. Try again later." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "GitHub could not retrieve this repository." },
        { status: 502 }
      );
    }

    const repository = await repoResponse.json();
    const rawIssues = await issuesResponse.json();

    // GitHub's issues endpoint also returns pull requests.
    const issues = rawIssues
      .filter((issue: { pull_request?: unknown }) => !issue.pull_request)
      .map((issue: {
        id: number;
        number: number;
        title: string;
        html_url: string;
        body: string | null;
        state: string;
        labels: { name: string; color: string }[];
        comments: number;
        created_at: string;
        updated_at: string;
      }) => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
        body: issue.body,
        state: issue.state,
        labels: issue.labels.map((label) => ({
          name: label.name,
          color: label.color,
        })),
        comments: issue.comments,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
      }));

    return NextResponse.json({
      repository: {
        name: repository.full_name,
        description: repository.description,
        url: repository.html_url,
        language: repository.language,
        stars: repository.stargazers_count,
        openIssues: repository.open_issues_count,
      },
      issues,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to GitHub. Please try again." },
      { status: 502 }
    );
  }
}