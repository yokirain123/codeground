import { CHALLENGES } from "./catalog";

const MILLISECONDS_PER_DAY = 86_400_000;

export function getDailyChallengeSlug(date = new Date()) {
  const utcDay = Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) /
      MILLISECONDS_PER_DAY,
  );

  return CHALLENGES[utcDay % CHALLENGES.length].slug;
}
