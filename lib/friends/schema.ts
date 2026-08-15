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

export type FriendshipStatus = "pending" | "accepted";

export const friendshipsTable = pgTable(
  "friendships",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

    requesterId: varchar("requester_id", { length: 255 })
      .notNull()
      .references(() => usersTable.clerkId, { onDelete: "cascade" }),

    addresseeId: varchar("addressee_id", { length: 255 })
      .notNull()
      .references(() => usersTable.clerkId, { onDelete: "cascade" }),

    pairKey: varchar("pair_key", { length: 520 }).notNull(),

    status: varchar("status", { length: 20 })
      .$type<FriendshipStatus>()
      .notNull()
      .default("pending"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    respondedAt: timestamp("responded_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("friendships_pair_unique").on(table.pairKey),
    index("friendships_requester_idx").on(table.requesterId),
    index("friendships_addressee_idx").on(table.addresseeId),
    index("friendships_status_idx").on(table.status),
    check(
      "friendships_different_users",
      sql`${table.requesterId} <> ${table.addresseeId}`,
    ),
    check(
      "friendships_valid_status",
      sql`${table.status} IN ('pending', 'accepted')`,
    ),
  ],
);
