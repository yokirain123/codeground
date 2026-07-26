import {
  integer,
  json,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "student",
  "admin",
]);

export const usersTable = pgTable("users", {
  id: integer("id")
    .primaryKey()
    .generatedAlwaysAsIdentity(),

  clerkId: varchar("clerk_id", { length: 255 })
    .notNull()
    .unique(),

  name: varchar("name", { length: 255 }).notNull(),

  email: varchar("email", { length: 255 })
    .notNull()
    .unique(),

  role: userRoleEnum("role")
    .notNull()
    .default("student"),

  points: integer("points")
    .notNull()
    .default(0),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export const coursesTable = pgTable("courses", {
  id: integer("id")
    .primaryKey()
    .generatedAlwaysAsIdentity(),

  title: varchar("title", { length: 255 }).notNull(),

  desc: text("description").notNull(),

  bannerImage: text("banner_image").notNull(),

  level: varchar("level", { length: 100 })
    .notNull()
    .default("Beginner"),

  tags: text("tags"),

  createdBy: integer("created_by")
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "restrict",
    }),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export interface Exercise {
  name: string;
  slug: string;
  xp: number;
  difficulty: "easy" | "medium" | "hard";
}

export const CourseChaptersTable = pgTable(
  "course_chapters",
  {
    id: integer("id")
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    courseId: integer("course_id")
      .notNull()
      .references(() => coursesTable.id, {
        onDelete: "cascade",
      }),

    chapterId: integer("chapter_id").notNull(),

    name: varchar("name", {
      length: 255,
    }).notNull(),

    desc: text("description").notNull(),

    exercises: jsonb("exercises")
      .$type<Exercise[]>()
      .notNull(),
  },
  (table) => [
    uniqueIndex("course_chapter_unique").on(
      table.courseId,
      table.chapterId,
    ),
  ],
);