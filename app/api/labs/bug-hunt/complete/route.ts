import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  awardLabCompletion,
  MissingCodeQuestProfileError,
} from "@/lib/labs/award";
import { getBugHuntMission } from "@/lib/labs/bug-hunt/catalog";
import { validateBugHuntSolution } from "@/lib/labs/bug-hunt/validation";
import { runWithJudge0 } from "@/lib/labs/judge0";

interface CompleteBugHuntBody {
  missionSlug?: unknown;
  code?: unknown;
  usedHint?: unknown;
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Sign in to complete Bug Hunt missions and earn XP." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as CompleteBugHuntBody;
    const missionSlug =
      typeof body.missionSlug === "string" ? body.missionSlug.trim() : "";
    const code = typeof body.code === "string" ? body.code : "";
    const usedHint = body.usedHint === true;
    const mission = getBugHuntMission(missionSlug);

    if (!mission) {
      return NextResponse.json(
        { error: "Bug Hunt mission not found." },
        { status: 404 },
      );
    }

    if (!code.trim() || code.length > 60_000) {
      return NextResponse.json(
        { error: "Submit the code you want to check." },
        { status: 400 },
      );
    }

    // Re-run on the server before awarding XP. Console output supplied by a
    // browser must never be trusted for progression.
    const execution = await runWithJudge0({
      language: mission.language,
      code,
    });

    if (!execution.success) {
      return NextResponse.json(
        {
          error: "The program must compile and run before the bug can be cleared.",
          output: execution.output,
        },
        { status: 422 },
      );
    }

    const validation = validateBugHuntSolution({
      slug: missionSlug,
      code,
      stdout: execution.stdout,
    });

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: validation.errors[0] ?? "The bug is still hiding in the code.",
          validationErrors: validation.errors,
        },
        { status: 422 },
      );
    }

    const xp = Math.max(0, mission.xp - (usedHint ? mission.hintCost : 0));
    const award = await awardLabCompletion({
      userId,
      lab: "bug-hunt",
      missionSlug,
      xp,
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
    console.error("Bug Hunt completion error:", error);

    if (error instanceof MissingCodeQuestProfileError) {
      return NextResponse.json(
        { error: `${error.message} Refresh the Dashboard and try again.` },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Failed to complete the Bug Hunt mission." },
      { status: 500 },
    );
  }
}
