import { auth } from "@clerk/nextjs/server";
import { and, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/config/db";
import { friendshipsTable } from "@/lib/friends/schema";

interface RouteContext {
  params: Promise<{ friendId: string }>;
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const friendshipId = Number((await params).friendId);

    if (!Number.isInteger(friendshipId) || friendshipId <= 0) {
      return NextResponse.json(
        { error: "Invalid friendship." },
        { status: 400 },
      );
    }

    const [deleted] = await db
      .delete(friendshipsTable)
      .where(
        and(
          eq(friendshipsTable.id, friendshipId),
          eq(friendshipsTable.status, "accepted"),
          or(
            eq(friendshipsTable.requesterId, userId),
            eq(friendshipsTable.addresseeId, userId),
          ),
        ),
      )
      .returning({ id: friendshipsTable.id });

    if (!deleted) {
      return NextResponse.json(
        { error: "Friendship not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ removed: true });
  } catch (error) {
    console.error("Failed to remove friend:", error);
    return NextResponse.json(
      { error: "Failed to remove friend." },
      { status: 500 },
    );
  }
}
