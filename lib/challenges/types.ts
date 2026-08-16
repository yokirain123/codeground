export const CHALLENGE_LANGUAGES = ["HTML", "CSS", "React", "Python"] as const;

export const CHALLENGE_DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type ChallengeLanguage = (typeof CHALLENGE_LANGUAGES)[number];

export type ChallengeDifficulty = (typeof CHALLENGE_DIFFICULTIES)[number];

export type ChallengeEnvironment = "html" | "css" | "react" | "python";

export interface ChallengeDefinition {
  slug: string;
  title: string;
  description: string;
  language: ChallengeLanguage;
  difficulty: ChallengeDifficulty;
  environment: ChallengeEnvironment;
  xp: number;
  estimatedMinutes: number;
  tags: string[];
  learn: string;
  task: string;
  requirements: string[];
  hint: string;
  starterCode: Record<string, string>;
  exampleOutput?: string;
}

export interface ChallengeSummary {
  slug: string;
  title: string;
  description: string;
  language: ChallengeLanguage;
  difficulty: ChallengeDifficulty;
  xp: number;
  estimatedMinutes: number;
  tags: string[];
}

export interface ChallengeCompletionSummary {
  challengeSlug: string;
  xpEarned: number;
  completedAt: string;
}
