import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { db } from "@/config/db";
import { getChallengeBySlug } from "@/lib/challenges/catalog";
import { challengeCompletionsTable } from "@/lib/challenges/schema";

import ChallengeWorkspace from "./_components/ChallengeWorkspace";

export const dynamic = "force-dynamic";

interface ChallengePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ChallengePage({ params }: ChallengePageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const challenge = getChallengeBySlug(slug);

  if (!challenge) {
    notFound();
  }

  const { userId } = await auth();

  const [completion] = userId
    ? await db
        .select({ id: challengeCompletionsTable.id })
        .from(challengeCompletionsTable)
        .where(
          and(
            eq(challengeCompletionsTable.userId, userId),
            eq(challengeCompletionsTable.challengeSlug, slug),
          ),
        )
        .limit(1)
    : [];

  return (
    <ChallengeWorkspace
      challenge={challenge}
      initialCompleted={Boolean(completion)}
    />
  );
}
