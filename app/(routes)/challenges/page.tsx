import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import Footer from "@/app/_components/Footer";
import { db } from "@/config/db";
import {
  getChallengeBySlug,
  getChallengeSummaries,
} from "@/lib/challenges/catalog";
import { getDailyChallengeSlug } from "@/lib/challenges/daily";
import { challengeCompletionsTable } from "@/lib/challenges/schema";

import ChallengesCatalog from "./_components/ChallengesCatalog";

export const dynamic = "force-dynamic";

export default async function ChallengesPage() {
  const { userId } = await auth();

  const completedChallenges = userId
    ? await db
        .select({
          challengeSlug: challengeCompletionsTable.challengeSlug,
          xpEarned: challengeCompletionsTable.xpEarned,
          completedAt: challengeCompletionsTable.completedAt,
        })
        .from(challengeCompletionsTable)
        .where(eq(challengeCompletionsTable.userId, userId))
    : [];

  const dailySlug = getDailyChallengeSlug();
  const dailyChallenge = getChallengeBySlug(dailySlug);

  return (
    <>
      <ChallengesCatalog
        challenges={getChallengeSummaries()}
        dailySlug={dailyChallenge?.slug ?? dailySlug}
        completions={completedChallenges.map(
          (completion: {
            challengeSlug: string;
            xpEarned: number;
            completedAt: Date;
          }) => ({
            ...completion,
            completedAt: completion.completedAt.toISOString(),
          }),
        )}
      />
      <Footer />
    </>
  );
}
