import "server-only";

import { and, eq, gt, inArray, sql } from "drizzle-orm";

import { db } from "@/config/db";
import {
  completedExercisesTable,
  courseEnrollmentsTable,
  CourseChaptersTable,
  coursesTable,
  usersTable,
} from "@/config/schema";
import { friendshipsTable } from "@/lib/friends/schema";

import { notificationsTable } from "./schema";
import type { NotificationEntityType, NotificationType } from "./types";

const DAY_MS = 86_400_000;
const COURSE_INACTIVITY_MS = 3 * DAY_MS;
const COURSE_REMINDER_COOLDOWN_MS = 7 * DAY_MS;

interface CreateNotificationInput {
  userId: string;
  actorId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  href?: string | null;
  entityType?: NotificationEntityType | null;
  entityId?: string | null;
  entityKey?: string | null;
}

function toDate(value: unknown) {
  if (value instanceof Date) return value;

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function getPlayerName(userId: string) {
  const [player] = await db
    .select({ name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.clerkId, userId))
    .limit(1);

  return player?.name?.trim() || "A CodeQuest player";
}

export async function createNotification(input: CreateNotificationInput) {
  const values = {
    userId: input.userId,
    actorId: input.actorId ?? null,
    type: input.type,
    title: input.title.trim().slice(0, 160),
    message: input.message.trim().slice(0, 2_000),
    href: input.href ?? null,
    entityType: input.entityType ?? null,
    entityId: input.entityId ?? null,
    entityKey: input.entityKey ?? null,
  };

  const [created] = await db
    .insert(notificationsTable)
    .values(values)
    .onConflictDoNothing()
    .returning({ id: notificationsTable.id });

  return created?.id ?? null;
}

export async function createFriendRequestNotification(input: {
  requestId: number;
  requesterId: string;
  addresseeId: string;
}) {
  const actorName = await getPlayerName(input.requesterId);

  return createNotification({
    userId: input.addresseeId,
    actorId: input.requesterId,
    type: "friend_request",
    title: "New friend request",
    message: `${actorName} wants to join your party.`,
    href: "/friends",
    entityType: "friendship",
    entityId: String(input.requestId),
    entityKey: `friend-request:${input.requestId}`,
  });
}

export async function createFriendAcceptedNotification(input: {
  friendshipId: number;
  actorId: string;
  recipientId: string;
}) {
  const actorName = await getPlayerName(input.actorId);

  return createNotification({
    userId: input.recipientId,
    actorId: input.actorId,
    type: "friend_accepted",
    title: "Friend request accepted",
    message: `${actorName} joined your party.`,
    href: `/players/${encodeURIComponent(input.actorId)}`,
    entityType: "friendship",
    entityId: String(input.friendshipId),
    entityKey: `friend-accepted:${input.friendshipId}:${input.recipientId}`,
  });
}

export async function dismissNotificationByEntity(input: {
  userId: string;
  entityType: NotificationEntityType;
  entityId: string;
  type?: NotificationType;
}) {
  const conditions = [
    eq(notificationsTable.userId, input.userId),
    eq(notificationsTable.entityType, input.entityType),
    eq(notificationsTable.entityId, input.entityId),
  ];

  if (input.type) {
    conditions.push(eq(notificationsTable.type, input.type));
  }

  await db
    .update(notificationsTable)
    .set({
      isRead: true,
      readAt: new Date(),
      dismissedAt: new Date(),
    })
    .where(and(...conditions));
}

export async function syncFriendRequestNotifications(userId: string) {
  const pendingRequests = await db
    .select({
      id: friendshipsTable.id,
      requesterId: friendshipsTable.requesterId,
      addresseeId: friendshipsTable.addresseeId,
    })
    .from(friendshipsTable)
    .where(
      and(
        eq(friendshipsTable.addresseeId, userId),
        eq(friendshipsTable.status, "pending"),
      ),
    );

  if (pendingRequests.length === 0) return;

  const requestIds = pendingRequests.map((friendRequest) =>
    String(friendRequest.id),
  );
  const existingNotifications = await db
    .select({ entityId: notificationsTable.entityId })
    .from(notificationsTable)
    .where(
      and(
        eq(notificationsTable.userId, userId),
        eq(notificationsTable.type, "friend_request"),
        inArray(notificationsTable.entityId, requestIds),
      ),
    );
  const existingRequestIds = new Set(
    existingNotifications.flatMap((notification) =>
      notification.entityId ? [notification.entityId] : [],
    ),
  );

  for (const friendRequest of pendingRequests
    .filter((request) => !existingRequestIds.has(String(request.id)))
    .slice(0, 20)) {
    await createFriendRequestNotification({
      requestId: friendRequest.id,
      requesterId: friendRequest.requesterId,
      addresseeId: friendRequest.addresseeId,
    });
  }
}

export async function syncCourseReminders(userId: string) {
  const enrollments = await db
    .select({
      courseId: courseEnrollmentsTable.courseId,
      enrolledAt: courseEnrollmentsTable.enrolledAt,
      title: coursesTable.title,
    })
    .from(courseEnrollmentsTable)
    .innerJoin(
      coursesTable,
      eq(courseEnrollmentsTable.courseId, coursesTable.id),
    )
    .where(eq(courseEnrollmentsTable.userId, userId));

  if (enrollments.length === 0) return;

  const courseIds = enrollments.map((enrollment) => enrollment.courseId);
  const now = new Date();
  const recentThreshold = new Date(now.getTime() - COURSE_REMINDER_COOLDOWN_MS);

  const [chapters, completionStats, recentReminders] = await Promise.all([
    db
      .select({
        courseId: CourseChaptersTable.courseId,
        exercises: CourseChaptersTable.exercises,
      })
      .from(CourseChaptersTable)
      .where(inArray(CourseChaptersTable.courseId, courseIds)),
    db
      .select({
        courseId: CourseChaptersTable.courseId,
        completedCount: sql<number>`count(${completedExercisesTable.id})::integer`,
        lastCompletedAt: sql<unknown>`max(${completedExercisesTable.completedAt})`,
      })
      .from(completedExercisesTable)
      .innerJoin(
        CourseChaptersTable,
        eq(completedExercisesTable.chapterId, CourseChaptersTable.id),
      )
      .where(
        and(
          eq(completedExercisesTable.userId, userId),
          inArray(CourseChaptersTable.courseId, courseIds),
        ),
      )
      .groupBy(CourseChaptersTable.courseId),
    db
      .select({ entityId: notificationsTable.entityId })
      .from(notificationsTable)
      .where(
        and(
          eq(notificationsTable.userId, userId),
          eq(notificationsTable.type, "course_reminder"),
          gt(notificationsTable.createdAt, recentThreshold),
        ),
      ),
  ]);

  const totalExercises = new Map<number, number>();

  for (const chapter of chapters) {
    totalExercises.set(
      chapter.courseId,
      (totalExercises.get(chapter.courseId) ?? 0) + chapter.exercises.length,
    );
  }

  const completionMap = new Map(
    completionStats.map((completion) => [completion.courseId, completion]),
  );
  const recentlyReminded = new Set(
    recentReminders.flatMap((reminder) =>
      reminder.entityId ? [Number(reminder.entityId)] : [],
    ),
  );
  const reminderBucket = Math.floor(
    now.getTime() / COURSE_REMINDER_COOLDOWN_MS,
  );

  const eligible = enrollments.filter((enrollment) => {
    const total = totalExercises.get(enrollment.courseId) ?? 0;
    const progress = completionMap.get(enrollment.courseId);
    const completed = Number(progress?.completedCount ?? 0);

    if (total === 0 || completed >= total) return false;
    if (recentlyReminded.has(enrollment.courseId)) return false;

    const lastActivity =
      toDate(progress?.lastCompletedAt) ?? enrollment.enrolledAt;

    return now.getTime() - lastActivity.getTime() >= COURSE_INACTIVITY_MS;
  });

  for (const enrollment of eligible.slice(0, 3)) {
    await createNotification({
      userId,
      type: "course_reminder",
      title: "Your quest is waiting",
      message: `Continue ${enrollment.title} and complete your next coding quest.`,
      href: `/courses/${enrollment.courseId}`,
      entityType: "course",
      entityId: String(enrollment.courseId),
      entityKey: `course-reminder:${enrollment.courseId}:${reminderBucket}`,
    });
  }
}
