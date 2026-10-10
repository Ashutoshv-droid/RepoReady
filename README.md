This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


Supabase Tables

Table	Purpose
user_profiles	User profile and preferences
user_repos	Tracked repositories per user
user_issues	Issues a user is working on
user_skills	Skills linked to each user
skills	Global skills reference list
user_achievements	Earned achievements per user

repoready/
├── app/
│   ├── layout.tsx          # Root layout with AppShell
│   ├── page.tsx            # Home page
│   ├── discover/           # GitHub repo search & issue discovery
│   ├── roadmap/            # Tracked repos and contribution roadmap
│   ├── skills/             # Skills management
│   ├── achievements/       # Achievement display
│   ├── settings/           # Profile settings
│   ├── login/              # GitHub OAuth sign-in
│   ├── auth/callback/      # Supabase OAuth callback
│   └── api/
│       ├── github/issues/  # Live GitHub issue fetching
│       └── gemma-hint/     # AI contribution hints
├── components/
│   ├── RepoRoadmapCard.tsx
│   ├── auth/
│   ├── dashboard/
│   ├── github/
│   ├── layout/
│   └── ui/
├── hooks/
│   ├── useUser.ts
│   └── useProgress.ts
├── lib/
│   ├── demo-data.ts
│   └── supabase/
├── types/
│   └── index.ts
└── public/
