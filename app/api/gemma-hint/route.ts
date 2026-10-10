import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SKILL_PROMPT = readFileSync(
  join(process.cwd(), "lib/skills/repoready.md"),
  "utf-8"
);

export async function POST(req: NextRequest) {
  try {
    const {
      issueTitle,
      issueBody,
      issueLabels,
      issueNumber,
      issueComments,
      repoName,
      repoUrl,
      stage,
      notes,
      experienceLevel,
      skills,
    } = await req.json();

    const issuePrompt = issueTitle
      ? `
Analyze the following GitHub issue and produce a contribution plan using your required response format.

## Repository
${repoName ? `Name: ${repoName}` : ""}
${repoUrl  ? `URL: ${repoUrl}`  : ""}

## Issue
Number: ${issueNumber ? `#${issueNumber}` : "unknown"}
Title: ${issueTitle}

${issueBody
  ? `Description:\n${issueBody.slice(0, 2000)}`
  : "No description provided."}

${issueLabels?.length ? `Labels: ${issueLabels.join(", ")}` : "No labels."}
${issueComments !== undefined ? `Comments: ${issueComments}` : ""}

Note: No source files have been provided. Follow your rules and do not invent file paths or repository structure.
      `.trim()
      : `
A developer is working on an open-source contribution and needs a gentle nudge.

Repository: ${repoName ?? "unknown"}
Current stage: ${stage ?? "unknown"}
Stuck on: ${notes ?? "nothing specific"}
Experience level: ${experienceLevel ?? "beginner"}
Skills: ${skills?.join(", ") ?? "not specified"}

Using your role as a contribution mentor, give a 2-3 line hint. Do not give the full solution.
      `.trim();

    const response = await ai.models.generateContent({
      model: "gemma-4-26b-a4b-it",
      contents: issuePrompt,
      config: {
        systemInstruction: SKILL_PROMPT,
      },
    });

    const hint = response.text;
    return NextResponse.json({ hint });

  } catch (error) {
    console.error("Gemma hint error:", error);
    return NextResponse.json(
      { error: "Failed to generate hint" },
      { status: 500 }
    );
  }
}
