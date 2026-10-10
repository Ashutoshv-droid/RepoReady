// types/index.ts

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type SkillLevel = "learning" | "familiar" | "proficient" | "expert";

export interface Skill {
  name: string;
  level: SkillLevel;
}

export interface Issue {
  id: string;
  title: string;
  repository: string;
  issueNumber: number;
  difficulty: Difficulty;
  skills: string[];
  matchExplanation: string;
  githubUrl: string;
  language: string;
  labels: string[];
  isBookmarked?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  category: "contribution" | "learning" | "community" | "milestone";
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  resources?: { label: string; url: string }[];
}

export interface UserProfile {
  name: string;
  githubHandle: string;
  avatarInitials: string;
  experienceLevel: "complete-beginner" | "some-experience" | "comfortable";
  languages: string[];
}

export interface Stats {
  issuesExplored: number;
  contributionsCompleted: number;
  skillsInProgress: number;
  currentLevel: string;
}

// Append to the bottom of types/index.ts

// ── Real GitHub API response types ──────────────────────────────
// These match exactly what app/api/github/issues/route.ts returns.

export interface GitHubLabel {
  name: string;
  color: string; // hex without #, e.g. "e4e669"
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  url: string;
  body: string | null;
  state: string;
  labels: GitHubLabel[];
  comments: number;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubRepository {
  name: string;         // e.g. "vercel/next.js"
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  openIssues: number;
}

export interface GitHubSearchResult {
  repository: GitHubRepository;
  issues: GitHubIssue[];
}

export interface GitHubSearchError {
  error: string;
}
