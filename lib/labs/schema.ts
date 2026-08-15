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

export const labCompletionsTable = pgTable(
  "lab_completions",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => usersTable.clerkId, {
        onDelete: "cascade",
      }),

    lab: varchar("lab", { length: 50 }).notNull(),

    missionSlug: varchar("mission_slug", { length: 255 }).notNull(),

    xpEarned: integer("xp_earned").notNull(),

    completedAt: timestamp("completed_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("lab_completion_unique").on(
      table.userId,
      table.lab,
      table.missionSlug,
    ),
    index("lab_completions_user_idx").on(table.userId),
    index("lab_completions_lab_idx").on(table.lab),
    check("lab_completion_xp_non_negative", sql`${table.xpEarned} >= 0`),
  ],
);
