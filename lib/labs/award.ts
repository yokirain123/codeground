import "server-only";

import { eq, sql } from "drizzle-orm";

import { db } from "@/config/db";
import { usersTable } from "@/config/schema";

import { labCompletionsTable } from "./schema";
import type { LabId } from "./types";

interface AwardLabCompletionInput {
  userId: string;
  lab: LabId;
  missionSlug: string;
  xp: number;
}

export class MissingCodeQuestProfileError extends Error {
  constructor() {
    super("Your CodeQuest profile is not ready yet.");
    this.name = "MissingCodeQuestProfileError";
  }
}

export async function awardLabCompletion({
  userId,
  lab,
  missionSlug,
  xp,
}: AwardLabCompletionInput) {
  const safeXp = Math.max(0, Math.floor(xp));

  const [profile] = await db
    .select({ clerkId: usersTable.clerkId })
    .from(usersTable)
    .where(eq(usersTable.clerkId, userId))
    .limit(1);

  if (!profile) {
    throw new MissingCodeQuestProfileError();
  }

  const result = await db.execute(sql`
  WITH inserted_completion AS (
    INSERT INTO ${labCompletionsTable}
      ("user_id", "lab", "mission_slug", "xp_earned")
    VALUES (${userId}, ${lab}, ${missionSlug}, ${safeXp})
    ON CONFLICT ("user_id", "lab", "mission_slug") DO NOTHING
    RETURNING "xp_earned"
  ),
  updated_user AS (
    UPDATE ${usersTable}
    SET "points" = ${usersTable.points} + inserted_completion."xp_earned"
    FROM inserted_completion
    WHERE ${usersTable.clerkId} = ${userId}
    RETURNING inserted_completion."xp_earned"
  )
  SELECT
    EXISTS (
      SELECT 1 FROM inserted_completion
    ) AS "isNew",

    COALESCE(
      (SELECT "xp_earned" FROM inserted_completion),
      (
        SELECT "xp_earned"
        FROM ${labCompletionsTable}
        WHERE "user_id" = ${userId}
          AND "lab" = ${lab}
          AND "mission_slug" = ${missionSlug}
        LIMIT 1
      ),
      0
    )::integer AS "xpEarned"
`);

const row = result.rows[0] as
  | {
      isNew: boolean;
      xpEarned: number;
    }
  | undefined;

if (!row) {
  throw new Error("Failed to save the lab completion.");
}

return {
  alreadyCompleted: !row.isNew,
  xpEarned: Number(row.xpEarned),
}
}
