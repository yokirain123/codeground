import { auth } from "@clerk/nextjs/server";
import { and, asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/config/db";
import { labCompletionsTable } from "@/lib/labs/schema";
import { labIds, type LabId } from "@/lib/labs/types";

function isLabId(value: string | null): value is LabId {
  return Boolean(value && (labIds as readonly string[]).includes(value));
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lab = new URL(request.url).searchParams.get("lab");

    if (lab && !isLabId(lab)) {
      return NextResponse.json({ error: "Unknown lab." }, { status: 400 });
    }

    const selection = {
      lab: labCompletionsTable.lab,
      missionSlug: labCompletionsTable.missionSlug,
      xpEarned: labCompletionsTable.xpEarned,
      completedAt: labCompletionsTable.completedAt,
    };

    const completions = lab
      ? await db
          .select(selection)
          .from(labCompletionsTable)
          .where(
            and(
              eq(labCompletionsTable.userId, userId),
              eq(labCompletionsTable.lab, lab),
            ),
          )
          .orderBy(asc(labCompletionsTable.completedAt))
      : await db
          .select(selection)
          .from(labCompletionsTable)
          .where(eq(labCompletionsTable.userId, userId))
          .orderBy(asc(labCompletionsTable.completedAt));

    return NextResponse.json({ completions });
  } catch (error) {
    console.error("Lab progress error:", error);
    return NextResponse.json(
      { error: "Failed to load lab progress." },
      { status: 500 },
    );
  }
}
