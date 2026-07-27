import {
  index,
  integer,
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

export const courseEnrollmentsTable = pgTable(
  "course_enrollments",
  {
    id: integer("id")
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    courseId: integer("course_id")
      .notNull()
      .references(() => coursesTable.id, {
        onDelete: "cascade",
      }),

    userId: varchar("user_id")
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
      }),

    enrolledAt: timestamp("enrolled_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    xpEarned: integer("xp_earned")
      .notNull()
      .default(0),
  },
  (table) => [
    uniqueIndex("course_enrollment_unique").on(
      table.userId,
      table.courseId,
    ),
  ],
);

export const completedExercisesTable = pgTable(
  "completed_exercises",
  {
    id: integer("id")
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    userId: varchar("user_id", {
      length: 255,
    })
      .notNull()
      .references(() => usersTable.clerkId, {
        onDelete: "cascade",
      }),
      
    chapterId: integer("chapter_id")
      .notNull()
      .references(() => CourseChaptersTable.id, {
        onDelete: "cascade",
      }),

    exerciseSlug: varchar("exercise_slug", {
      length: 255,
    }).notNull(),

    completedAt: timestamp("completed_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("completed_exercise_unique").on(
      table.userId,
      table.chapterId,
      table.exerciseSlug,
    ),

    index("completed_exercises_chapter_idx").on(
      table.chapterId,
    ),
  ],
);