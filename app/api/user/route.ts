import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const email =
      user.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: "User does not have an email address" },
        { status: 400 },
      );
    }

    const [savedUser] = await db
      .insert(usersTable)
      .values({
        clerkId: user.id,
        name: user.fullName ?? user.firstName ?? "User",
        email,
        // role та points встановляться через default
      })
      .onConflictDoUpdate({
        target: usersTable.clerkId,
        set: {
          name: user.fullName ?? user.firstName ?? "User",
          email,
        },
      })
      .returning();

    return NextResponse.json(savedUser);
  } catch (error) {
    console.error("Failed to create user:", error);

    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}