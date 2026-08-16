export const NOTIFICATION_TYPES = [
  "friend_request",
  "friend_accepted",
  "course_reminder",
  "achievement",
  "system",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type NotificationEntityType =
  | "friendship"
  | "course"
  | "achievement"
  | "system";

export interface NotificationActor {
  userId: string;
  name: string;
  avatarUrl: string | null;
}

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  href: string | null;
  entityType: NotificationEntityType | null;
  entityId: string | null;
  isRead: boolean;
  createdAt: string;
  actor: NotificationActor | null;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}
