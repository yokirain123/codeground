import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { usersTable } from "@/config/schema";

import type { NotificationEntityType, NotificationType } from "./types";

export const notificationsTable = pgTable(
  "notifications",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => usersTable.clerkId, { onDelete: "cascade" }),

    actorId: varchar("actor_id", { length: 255 }).references(
      () => usersTable.clerkId,
      { onDelete: "set null" },
    ),

    type: varchar("type", { length: 40 }).$type<NotificationType>().notNull(),

    title: varchar("title", { length: 160 }).notNull(),
    message: text("message").notNull(),
    href: text("href"),

    entityType: varchar("entity_type", {
      length: 40,
    }).$type<NotificationEntityType>(),
    entityId: varchar("entity_id", { length: 255 }),
    entityKey: varchar("entity_key", { length: 520 }),

    isRead: boolean("is_read").notNull().default(false),
    readAt: timestamp("read_at", { withTimezone: true }),
    dismissedAt: timestamp("dismissed_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("notifications_entity_unique").on(
      table.userId,
      table.entityKey,
    ),
    index("notifications_user_created_idx").on(table.userId, table.createdAt),
    index("notifications_user_unread_idx").on(table.userId, table.isRead),
    check(
      "notifications_valid_type",
      sql`${table.type} IN ('friend_request', 'friend_accepted', 'course_reminder', 'achievement', 'system')`,
    ),
  ],
);
