import "server-only";

import { clerkClient } from "@clerk/nextjs/server";

export async function getClerkAvatarMap(userIds: string[]) {
  const uniqueIds = [...new Set(userIds)].filter(Boolean).slice(0, 100);
  const avatarMap = new Map<string, string | null>();

  if (uniqueIds.length === 0) {
    return avatarMap;
  }

  try {
    const client = await clerkClient();
    const { data } = await client.users.getUserList({
      userId: uniqueIds,
      limit: uniqueIds.length,
    });

    for (const user of data) {
      avatarMap.set(user.id, user.imageUrl || null);
    }
  } catch (error) {
    // A temporary Clerk API error should not make the friends page unusable.
    console.error("Failed to load friend avatars from Clerk:", error);
  }

  return avatarMap;
}
