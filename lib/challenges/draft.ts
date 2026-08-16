export const CHALLENGE_DRAFT_PREFIX = "codequest:challenge-draft:";

export function getChallengeDraftKey(slug: string) {
  return `${CHALLENGE_DRAFT_PREFIX}${slug}`;
}
