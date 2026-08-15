export interface GitSandboxMission {
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  objective: string[];
  suggestedCommands: string[];
  xp: number;
  hint: string;
}

export const gitSandboxMissions: GitSandboxMission[] = [
  {
    slug: "first-checkpoint",
    title: "First Checkpoint",
    difficulty: "Easy",
    description: "Change the README and save your first clean checkpoint.",
    objective: [
      "Edit README.md in the workspace.",
      "Stage the changed file.",
      "Create a commit with your own message.",
    ],
    suggestedCommands: [
      "git status",
      "git add README.md",
      'git commit -m "Update README"',
      "git log --oneline",
    ],
    xp: 50,
    hint: "Edit the file first, then use git add before git commit.",
  },
  {
    slug: "feature-branch",
    title: "Feature Branch",
    difficulty: "Medium",
    description: "Build a change away from main, then merge it safely.",
    objective: [
      "Create and switch to a branch named feature.",
      "Edit app.js, stage it and commit the change.",
      "Return to main and merge feature.",
    ],
    suggestedCommands: [
      "git switch -c feature",
      "git add app.js",
      'git commit -m "Build feature"',
      "git switch main",
      "git merge feature",
    ],
    xp: 80,
    hint: "git switch -c feature creates the branch and switches to it in one command.",
  },
  {
    slug: "revert-broken-release",
    title: "Undo the Broken Release",
    difficulty: "Medium",
    description: "The latest commit broke production. Revert it without deleting history.",
    objective: [
      "Inspect the recent commit history.",
      "Create a new commit that reverses HEAD.",
      "Keep the broken commit visible in the history.",
    ],
    suggestedCommands: ["git log --oneline", "git revert HEAD", "git status"],
    xp: 80,
    hint: "Reset rewrites state. This mission asks for the command that creates a new undo commit.",
  },
  {
    slug: "resolve-merge-conflict",
    title: "Merge Conflict",
    difficulty: "Hard",
    description: "Main and feature changed the same line. Resolve the collision and finish the merge.",
    objective: [
      "Merge the existing feature branch into main.",
      "Edit app.js and remove every conflict marker.",
      "Stage app.js and commit the resolved merge.",
    ],
    suggestedCommands: [
      "git merge feature",
      "git status",
      "git add app.js",
      'git commit -m "Resolve greeting conflict"',
      "git log --oneline --graph",
    ],
    xp: 120,
    hint: "After the merge fails, edit app.js, keep the final greeting you want, and remove <<<<<<<, ======= and >>>>>>>.",
  },
];

export function getGitSandboxMission(slug: string) {
  return gitSandboxMissions.find((mission) => mission.slug === slug);
}
