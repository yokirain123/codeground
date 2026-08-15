export interface GitCommit {
  id: string;
  message: string;
  parents: string[];
  snapshot: Record<string, string>;
  order: number;
}

export interface GitSandboxState {
  missionSlug: string;
  commits: Record<string, GitCommit>;
  branches: Record<string, string>;
  currentBranch: string;
  workingFiles: Record<string, string>;
  stagedFiles: string[];
  conflictFiles: string[];
  mergeParent: string | null;
  nextCommitNumber: number;
  terminal: string[];
}

export interface GitCommandResult {
  state: GitSandboxState;
  output: string;
}
