import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { usersTable } from "@/config/schema";

export const challengeCompletionsTable = pgTable(
  "challenge_completions",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => usersTable.clerkId, {
        onDelete: "cascade",
      }),

    challengeSlug: varchar("challenge_slug", {
      length: 255,
    }).notNull(),

    xpEarned: integer("xp_earned").notNull(),

    completedAt: timestamp("completed_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("challenge_completion_unique").on(
      table.userId,
      table.challengeSlug,
    ),
    index("challenge_completions_user_idx").on(table.userId),
    index("challenge_completions_slug_idx").on(table.challengeSlug),
    check("challenge_completion_xp_non_negative", sql`${table.xpEarned} >= 0`),
  ],
);
