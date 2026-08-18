import { auth } from "@clerk/nextjs/server";
import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { getChallengeBySlug } from "@/lib/challenges/catalog";
import { challengeCompletionsTable } from "@/lib/challenges/schema";
import { validateChallengeSubmission } from "@/lib/challenges/validation";
import { getServerI18n } from "@/lib/i18n/server";

interface CompleteChallengeBody {
  files?: unknown;
  executionOutput?: unknown;
  stdin?: unknown;
}

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function POST(request: Request, { params }: RouteContext) {
  const { locale, t } = await getServerI18n();

  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { error: t("Sign in to complete challenges and earn XP.") },
        { status: 401 },
      );
    }

    const { slug: rawSlug } = await params;
    const slug = decodeURIComponent(rawSlug).trim();
    const challenge = getChallengeBySlug(slug, locale);

    if (!challenge) {
      return NextResponse.json(
        { error: t("Challenge not found.") },
        { status: 404 },
      );
    }

    const [currentUser] = await db
      .select({ clerkId: usersTable.clerkId })
      .from(usersTable)
      .where(eq(usersTable.clerkId, clerkId))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json(
        {
          error:
            t(
              "Your CodeQuest profile is not ready yet. Refresh the page and try again.",
            ),
        },
        { status: 404 },
      );
    }

    const [existingCompletion] = await db
      .select({
        id: challengeCompletionsTable.id,
        xpEarned: challengeCompletionsTable.xpEarned,
      })
      .from(challengeCompletionsTable)
      .where(
        and(
          eq(challengeCompletionsTable.userId, clerkId),
          eq(challengeCompletionsTable.challengeSlug, slug),
        ),
      )
      .limit(1);

    if (existingCompletion) {
      return NextResponse.json({
        completed: true,
        alreadyCompleted: true,
        xpEarned: existingCompletion.xpEarned,
      });
    }

    const body = (await request.json()) as CompleteChallengeBody;

    if (
      !body.files ||
      typeof body.files !== "object" ||
      Array.isArray(body.files)
    ) {
      return NextResponse.json(
        { error: t("Submit your current challenge files.") },
        { status: 400 },
      );
    }

    const executionOutput =
      typeof body.executionOutput === "string" ? body.executionOutput : "";

    const validation = validateChallengeSubmission(
      slug,
      body.files as Record<string, unknown>,
      executionOutput,
      locale,
    );

    if (!validation.valid) {
      return NextResponse.json(
        {
          error:
            validation.errors[0] ??
            t("The challenge requirements are not complete yet."),
          validationErrors: validation.errors,
        },
        { status: 422 },
      );
    }

    // neon-http does not support callback-style db.transaction(). The CTE keeps
    // the completion insert and XP update atomic in one Postgres statement.
    const result = await db.execute(sql`
      WITH inserted_completion AS (
        INSERT INTO ${challengeCompletionsTable}
          ("user_id", "challenge_slug", "xp_earned")
        VALUES (${clerkId}, ${slug}, ${challenge.xp})
        ON CONFLICT ("user_id", "challenge_slug") DO NOTHING
        RETURNING "xp_earned"
      ),
      updated_user AS (
        UPDATE ${usersTable}
        SET "points" = ${usersTable.points} + inserted_completion."xp_earned"
        FROM inserted_completion
        WHERE ${usersTable.clerkId} = ${clerkId}
        RETURNING inserted_completion."xp_earned"
      )
      SELECT
        EXISTS (SELECT 1 FROM inserted_completion) AS "isNew",
        COALESCE(
          (SELECT "xp_earned" FROM inserted_completion),
          (
            SELECT "xp_earned"
            FROM ${challengeCompletionsTable}
            WHERE "user_id" = ${clerkId}
              AND "challenge_slug" = ${slug}
            LIMIT 1
          ),
          0
        )::integer AS "xpEarned"
    `);

    const award = result.rows[0] as
      | { isNew: boolean; xpEarned: number }
      | undefined;

    if (!award) {
      throw new Error("Failed to save the challenge completion.");
    }

    return NextResponse.json(
      {
        completed: true,
        alreadyCompleted: !award.isNew,
        xpEarned: Number(award.xpEarned),
      },
      { status: award.isNew ? 201 : 200 },
    );
  } catch (error) {
    console.error("Challenge completion error:", error);

    return NextResponse.json(
      { error: t("Failed to complete the challenge.") },
      { status: 500 },
    );
  }
}
