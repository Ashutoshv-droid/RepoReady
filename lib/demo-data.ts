// lib/demo-data.ts
// All values below are explicitly demo data — not connected to any real API or user account.

import type { Issue, Achievement, RoadmapStep, Skill, Stats, UserProfile } from "@/types";

export const DEMO_NOTICE = "Demo data — not your real stats";

export const demoStats: Stats = {
  issuesExplored: 24,
  contributionsCompleted: 3,
  skillsInProgress: 5,
  currentLevel: "Beginner",
};

export const demoProfile: UserProfile = {
  name: "Alex Dev",
  githubHandle: "alexdev",
  avatarInitials: "AD",
  experienceLevel: "some-experience",
  languages: ["JavaScript", "TypeScript", "Python"],
};

export const demoIssues: Issue[] = [
  {
    id: "issue-1",
    title: "Add aria-label attributes to icon-only buttons",
    repository: "vercel/next.js",
    issueNumber: 58312,
    difficulty: "beginner",
    skills: ["HTML", "Accessibility", "React"],
    matchExplanation:
      "Matches your React familiarity. Accessibility improvements are a great first contribution — no deep codebase knowledge required.",
    githubUrl: "https://github.com/vercel/next.js/issues/58312",
    language: "TypeScript",
    labels: ["good first issue", "accessibility"],
    isBookmarked: false,
  },
  {
    id: "issue-2",
    title: "Fix typo in contributing guide and update setup steps",
    repository: "facebook/react",
    issueNumber: 27891,
    difficulty: "beginner",
    skills: ["Markdown", "Documentation"],
    matchExplanation:
      "Documentation fixes are the lowest-friction way to start contributing. No build system knowledge needed.",
    githubUrl: "https://github.com/facebook/react/issues/27891",
    language: "Markdown",
    labels: ["good first issue", "documentation"],
    isBookmarked: true,
  },
  {
    id: "issue-3",
    title: "Add unit tests for useLocalStorage hook",
    repository: "uidotdev/usehooks",
    issueNumber: 312,
    difficulty: "intermediate",
    skills: ["JavaScript", "Jest", "React Testing Library"],
    matchExplanation:
      "Your JavaScript background is a strong match. Writing tests builds habits that every maintainer values.",
    githubUrl: "https://github.com/uidotdev/usehooks/issues/312",
    language: "JavaScript",
    labels: ["help wanted", "testing"],
    isBookmarked: false,
  },
  {
    id: "issue-4",
    title: "Implement dark mode toggle for documentation site",
    repository: "tailwindlabs/tailwindcss",
    issueNumber: 13204,
    difficulty: "intermediate",
    skills: ["CSS", "Tailwind CSS", "JavaScript"],
    matchExplanation:
      "Tailwind CSS is already in your skill set. This scoped UI feature is achievable without touching core library code.",
    githubUrl: "https://github.com/tailwindlabs/tailwindcss/issues/13204",
    language: "CSS",
    labels: ["help wanted", "docs-site"],
    isBookmarked: false,
  },
  {
    id: "issue-5",
    title: "Improve error messages for invalid config schema",
    repository: "vitejs/vite",
    issueNumber: 14987,
    difficulty: "advanced",
    skills: ["TypeScript", "Node.js", "Zod"],
    matchExplanation:
      "Stretch goal — requires understanding Vite's config resolution pipeline. Tackle this after a few smaller contributions.",
    githubUrl: "https://github.com/vitejs/vite/issues/14987",
    language: "TypeScript",
    labels: ["help wanted", "dx"],
    isBookmarked: false,
  },
  {
    id: "issue-6",
    title: "Add keyboard navigation to dropdown component",
    repository: "shadcn-ui/ui",
    issueNumber: 4102,
    difficulty: "beginner",
    skills: ["React", "TypeScript", "Accessibility"],
    matchExplanation:
      "Focused accessibility issue with a clear acceptance criterion. Your React and TypeScript skills are directly applicable.",
    githubUrl: "https://github.com/shadcn-ui/ui/issues/4102",
    language: "TypeScript",
    labels: ["good first issue", "accessibility", "component"],
    isBookmarked: false,
  },
];

export const demoSkills: Skill[] = [
  { name: "JavaScript", level: "proficient" },
  { name: "TypeScript", level: "familiar" },
  { name: "React", level: "familiar" },
  { name: "HTML", level: "proficient" },
  { name: "CSS", level: "familiar" },
  { name: "Git", level: "learning" },
  { name: "Node.js", level: "learning" },
  { name: "Python", level: "familiar" },
];

export const suggestedSkills: string[] = [
  "Jest / Testing",
  "Accessibility (a11y)",
  "Markdown / Docs",
  "GitHub Actions",
  "Open Source Etiquette",
];

export const demoAchievements: Achievement[] = [
  {
    id: "ach-1",
    title: "First Look",
    description: "Explored your first open-source issue.",
    icon: "👁️",
    earned: true,
    earnedDate: "2024-11-03",
    category: "contribution",
  },
  {
    id: "ach-2",
    title: "Skill Mapper",
    description: "Added 5 or more skills to your profile.",
    icon: "🗺️",
    earned: true,
    earnedDate: "2024-11-04",
    category: "learning",
  },
  {
    id: "ach-3",
    title: "Repo Analyst",
    description: "Analyzed your first GitHub repository.",
    icon: "🔍",
    earned: true,
    earnedDate: "2024-11-10",
    category: "milestone",
  },
  {
    id: "ach-4",
    title: "First Contribution",
    description: "Marked your first contribution as complete.",
    icon: "🚀",
    earned: false,
    category: "contribution",
  },
  {
    id: "ach-5",
    title: "Streak Starter",
    description: "Contributed in 3 consecutive weeks.",
    icon: "🔥",
    earned: false,
    category: "milestone",
  },
  {
    id: "ach-6",
    title: "Bug Hunter",
    description: "Completed a bug-fix contribution.",
    icon: "🐛",
    earned: false,
    category: "contribution",
  },
  {
    id: "ach-7",
    title: "Docs Champion",
    description: "Completed 3 documentation contributions.",
    icon: "📝",
    earned: false,
    category: "community",
  },
  {
    id: "ach-8",
    title: "Polyglot",
    description: "Contributed to repos in 3 different languages.",
    icon: "🌐",
    earned: false,
    category: "learning",
  },
];

export const demoRoadmapSteps: RoadmapStep[] = [
  {
    id: "step-1",
    title: "Understand the repository structure",
    description:
      "Read the README, CONTRIBUTING.md, and CODE_OF_CONDUCT. Identify where the issue lives in the codebase.",
    completed: true,
    resources: [
      { label: "How to read a codebase", url: "https://opensource.guide/how-to-contribute/" },
    ],
  },
  {
    id: "step-2",
    title: "Set up the local development environment",
    description:
      "Fork the repository, clone your fork, install dependencies, and verify the project runs locally.",
    completed: true,
    resources: [
      { label: "Fork a repo — GitHub Docs", url: "https://docs.github.com/en/get-started/quickstart/fork-a-repo" },
    ],
  },
  {
    id: "step-3",
    title: "Reproduce the issue or confirm the feature scope",
    description:
      "Follow the steps in the issue to reproduce the bug, or read the feature request carefully to understand the acceptance criteria.",
    completed: false,
  },
  {
    id: "step-4",
    title: "Write your fix or feature",
    description:
      "Make the smallest change that satisfies the issue. Keep commits focused and write clear commit messages.",
    completed: false,
    resources: [
      { label: "Conventional Commits", url: "https://www.conventionalcommits.org/" },
    ],
  },
  {
    id: "step-5",
    title: "Add or update tests",
    description:
      "If the project has a test suite, add a test that covers your change. Confirm all existing tests still pass.",
    completed: false,
  },
  {
    id: "step-6",
    title: "Open a pull request",
    description:
      "Push your branch, open a PR against the upstream repo, fill in the PR template, and reference the issue number.",
    completed: false,
    resources: [
      { label: "Creating a pull request — GitHub Docs", url: "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request" },
    ],
  },
];
