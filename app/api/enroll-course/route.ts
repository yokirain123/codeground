    import { auth } from "@clerk/nextjs/server";
    import { and, eq } from "drizzle-orm";
    import { NextResponse } from "next/server";

    import { db } from "@/config/db";
    import {
    courseEnrollmentsTable,
    coursesTable,
    usersTable,
    } from "@/config/schema";

    export async function GET(request: Request) {
    try {
        const { userId: clerkId } = await auth();

        if (!clerkId) {
        return NextResponse.json(
            {
            error: "Unauthorized",
            },
            {
            status: 401,
            },
        );
        }

        const courseId = Number(
        new URL(request.url).searchParams.get(
            "courseId",
        ),
        );

        if (
        !Number.isInteger(courseId) ||
        courseId <= 0
        ) {
        return NextResponse.json(
            {
            error: "Valid courseId is required",
            },
            {
            status: 400,
            },
        );
        }

        const [currentUser] = await db
        .select({
            id: usersTable.id,
        })
        .from(usersTable)
        .where(
            eq(
            usersTable.clerkId,
            clerkId,
            ),
        )
        .limit(1);

        if (!currentUser) {
        return NextResponse.json(
            {
            error: "User not found",
            },
            {
            status: 404,
            },
        );
        }

        const [enrollment] = await db
        .select({
            id: courseEnrollmentsTable.id,
        })
        .from(courseEnrollmentsTable)
        .where(
            and(
            eq(
                courseEnrollmentsTable.userId,
                clerkId,
            ),
            eq(
                courseEnrollmentsTable.courseId,
                courseId,
            ),
            ),
        )
        .limit(1);

        return NextResponse.json({
        isEnrolled: Boolean(enrollment),
        });
    } catch (error) {
        console.error(
        "Enrollment check error:",
        error,
        );

        return NextResponse.json(
        {
            error: "Failed to check enrollment",
        },
        {
            status: 500,
        },
        );
    }
    }

    export async function POST(request: Request) {
    try {
        const { userId: clerkId } = await auth();

        if (!clerkId) {
        return NextResponse.json(
            {
            error: "Unauthorized",
            },
            {
            status: 401,
            },
        );
        }

        const body = await request.json();
        const courseId = Number(body.courseId);

        if (
        !Number.isInteger(courseId) ||
        courseId <= 0
        ) {
        return NextResponse.json(
            {
            error: "Valid courseId is required",
            },
            {
            status: 400,
            },
        );
        }

        const [currentUser] = await db
        .select({
            id: usersTable.id,
        })
        .from(usersTable)
        .where(
            eq(
            usersTable.clerkId,
            clerkId,
            ),
        )
        .limit(1);

        if (!currentUser) {
        return NextResponse.json(
            {
            error: "User not found",
            },
            {
            status: 404,
            },
        );
        }

        const [course] = await db
        .select({
            id: coursesTable.id,
        })
        .from(coursesTable)
        .where(
            eq(
            coursesTable.id,
            courseId,
            ),
        )
        .limit(1);

        if (!course) {
        return NextResponse.json(
            {
            error: "Course not found",
            },
            {
            status: 404,
            },
        );
        }

        await db
        .insert(courseEnrollmentsTable)
        .values({
            courseId,
            userId: clerkId,
        })
        .onConflictDoNothing({
            target: [
            courseEnrollmentsTable.userId,
            courseEnrollmentsTable.courseId,
            ],
        });

        return NextResponse.json({
        isEnrolled: true,
        message: "Course enrolled",
        });
    } catch (error) {
        console.error(
        "Course enrollment error:",
        error,
        );

        return NextResponse.json(
        {
            error: "Failed to enroll in course",
        },
        {
            status: 500,
        },
        );
    }
    }

    export async function DELETE(request: Request) {
    try {
        const { userId: clerkId } = await auth();

        if (!clerkId) {
        return NextResponse.json(
            {
            error: "Unauthorized",
            },
            {
            status: 401,
            },
        );
        }

        const courseId = Number(
        new URL(request.url).searchParams.get(
            "courseId",
        ),
        );

        if (
        !Number.isInteger(courseId) ||
        courseId <= 0
        ) {
        return NextResponse.json(
            {
            error: "Valid courseId is required",
            },
            {
            status: 400,
            },
        );
        }

        const [currentUser] = await db
        .select({
            id: usersTable.id,
        })
        .from(usersTable)
        .where(
            eq(
            usersTable.clerkId,
            clerkId,
            ),
        )
        .limit(1);

        if (!currentUser) {
        return NextResponse.json(
            {
            error: "User not found",
            },
            {
            status: 404,
            },
        );
        }

        const deletedEnrollments = await db
        .delete(courseEnrollmentsTable)
        .where(
            and(
            eq(
                courseEnrollmentsTable.userId,
                clerkId,
            ),
            eq(
                courseEnrollmentsTable.courseId,
                courseId,
            ),
            ),
        )
        .returning({
            id: courseEnrollmentsTable.id,
        });

        return NextResponse.json({
        isEnrolled: false,
        removed: deletedEnrollments.length > 0,
        message: "You left the course",
        });
    } catch (error) {
        console.error(
        "Course unenrollment error:",
        error,
        );

        return NextResponse.json(
        {
            error: "Failed to leave course",
        },
        {
            status: 500,
        },
        );
    }
    }