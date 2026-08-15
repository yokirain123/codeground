import "server-only";

import { getGitSandboxMission } from "./catalog";
import type { GitSandboxState } from "./types";

export interface GitMissionValidationResult {
  valid: boolean;
  errors: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function isSerializedGitState(value: unknown): value is GitSandboxState {
  if (!isRecord(value)) return false;

  return (
    typeof value.missionSlug === "string" &&
    isRecord(value.commits) &&
    isRecord(value.branches) &&
    typeof value.currentBranch === "string" &&
    isRecord(value.workingFiles) &&
    Array.isArray(value.stagedFiles) &&
    Array.isArray(value.conflictFiles) &&
    (typeof value.mergeParent === "string" || value.mergeParent === null)
  );
}

function getHead(state: GitSandboxState) {
  const id = state.branches[state.currentBranch];
  return state.commits[id];
}

export function validateGitSandboxMission(
  slug: string,
  state: GitSandboxState,
): GitMissionValidationResult {
  const mission = getGitSandboxMission(slug);

  if (!mission || state.missionSlug !== slug) {
    return { valid: false, errors: ["Git Sandbox mission not found."] };
  }

  const errors: string[] = [];
  const head = getHead(state);

  if (!head) {
    return { valid: false, errors: ["The repository HEAD is invalid."] };
  }

  if (slug === "first-checkpoint") {
    const root = Object.values(state.commits).sort((a, b) => a.order - b.order)[0];
    const readmeChanged =
      head.snapshot["README.md"] !== root?.snapshot["README.md"];

    if (Object.keys(state.commits).length < 2 || !readmeChanged) {
      errors.push("Edit README.md, stage it and create a new commit.");
    }
  } else if (slug === "feature-branch") {
    const featureHead = state.branches.feature;
    const mainHead = state.branches.main;
    const root = Object.values(state.commits).sort((a, b) => a.order - b.order)[0];

    if (!featureHead) {
      errors.push("Create a branch named feature.");
    }

    if (state.currentBranch !== "main") {
      errors.push("Switch back to main before finishing the mission.");
    }

    if (
      !mainHead ||
      state.commits[mainHead]?.snapshot["app.js"] === root?.snapshot["app.js"]
    ) {
      errors.push("Commit the app.js change on feature and merge it into main.");
    }

    if (featureHead && mainHead) {
      const mainCommit = state.commits[mainHead];
      const mergedFeature =
        mainHead === featureHead || mainCommit?.parents.includes(featureHead);

      if (!mergedFeature) {
        errors.push("The feature branch has not been merged into main.");
      }
    }
  } else if (slug === "revert-broken-release") {
    if (!head.message.startsWith("Revert \"")) {
      errors.push("Use git revert HEAD to create an undo commit.");
    }

    if (!head.snapshot["app.js"]?.includes("Stable build")) {
      errors.push("The stable version of app.js has not been restored.");
    }
  } else if (slug === "resolve-merge-conflict") {
    if (state.currentBranch !== "main") {
      errors.push("Finish the merge on the main branch.");
    }

    if (state.conflictFiles.length > 0 || state.mergeParent) {
      errors.push("Resolve, stage and commit every merge conflict.");
    }

    if (head.parents.length < 2) {
      errors.push("The resolved merge commit has not been created yet.");
    }

    if (/^(<<<<<<<|=======|>>>>>>>)/m.test(head.snapshot["app.js"] ?? "")) {
      errors.push("Remove every conflict marker from app.js.");
    }
  }

  if (state.stagedFiles.length > 0) {
    errors.push("Commit the staged changes before completing the mission.");
  }

  return { valid: errors.length === 0, errors };
}
