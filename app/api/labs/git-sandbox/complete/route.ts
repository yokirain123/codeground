import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  awardLabCompletion,
  MissingCodeQuestProfileError,
} from "@/lib/labs/award";
import { getGitSandboxMission } from "@/lib/labs/git/catalog";
import {
  isSerializedGitState,
  validateGitSandboxMission,
} from "@/lib/labs/git/validation";

interface CompleteGitMissionBody {
  missionSlug?: unknown;
  state?: unknown;
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Sign in to complete Git Sandbox quests and earn XP." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as CompleteGitMissionBody;
    const missionSlug =
      typeof body.missionSlug === "string" ? body.missionSlug.trim() : "";
    const mission = getGitSandboxMission(missionSlug);

    if (!mission) {
      return NextResponse.json(
        { error: "Git Sandbox mission not found." },
        { status: 404 },
      );
    }

    if (!isSerializedGitState(body.state)) {
      return NextResponse.json(
        { error: "The simulated repository state is invalid." },
        { status: 400 },
      );
    }

    const serializedSize = JSON.stringify(body.state).length;

    if (serializedSize > 150_000) {
      return NextResponse.json(
        { error: "The simulated repository is too large." },
        { status: 413 },
      );
    }

    const validation = validateGitSandboxMission(missionSlug, body.state);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: validation.errors[0] ?? "The Git quest is not complete yet.",
          validationErrors: validation.errors,
        },
        { status: 422 },
      );
    }

    const award = await awardLabCompletion({
      userId,
      lab: "git-sandbox",
      missionSlug,
      xp: mission.xp,
    });

    return NextResponse.json(
      {
        completed: true,
        alreadyCompleted: award.alreadyCompleted,
        xpEarned: award.xpEarned,
      },
      { status: award.alreadyCompleted ? 200 : 201 },
    );
  } catch (error) {
    console.error("Git Sandbox completion error:", error);

    if (error instanceof MissingCodeQuestProfileError) {
      return NextResponse.json(
        { error: `${error.message} Refresh the Dashboard and try again.` },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Failed to complete the Git Sandbox mission." },
      { status: 500 },
    );
  }
}
