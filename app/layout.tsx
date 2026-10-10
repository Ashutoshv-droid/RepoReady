
import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "RepoReady — Open Source Contribution Assistant",
  description:
    "Find your next contribution. Build your skills. Grow into open source.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          backgroundColor: "var(--color-base)",
          color: "var(--color-primary)",
          fontFamily: "var(--font-sans)",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}