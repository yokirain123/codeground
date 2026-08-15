import type {
  GitCommandResult,
  GitCommit,
  GitSandboxState,
} from "./types";

function cloneSnapshot(snapshot: Record<string, string>) {
  return { ...snapshot };
}

function createCommit(
  id: string,
  message: string,
  parents: string[],
  snapshot: Record<string, string>,
  order: number,
): GitCommit {
  return {
    id,
    message,
    parents,
    snapshot: cloneSnapshot(snapshot),
    order,
  };
}

const BASE_README = "# CodeQuest\n\nA coding adventure for curious developers.\n";
const BASE_APP = 'console.log("CodeQuest ready");\n';

export function createGitSandboxState(missionSlug: string): GitSandboxState {
  if (missionSlug === "revert-broken-release") {
    const stable = {
      "README.md": BASE_README,
      "app.js": 'console.log("Stable build");\n',
    };
    const broken = {
      ...stable,
      "app.js": 'throw new Error("Broken release");\n',
    };
    const c1 = createCommit("c1a0f3", "Initial stable release", [], stable, 1);
    const c2 = createCommit("c2b8e1", "Ship risky hotfix", [c1.id], broken, 2);

    return {
      missionSlug,
      commits: { [c1.id]: c1, [c2.id]: c2 },
      branches: { main: c2.id },
      currentBranch: "main",
      workingFiles: cloneSnapshot(broken),
      stagedFiles: [],
      conflictFiles: [],
      mergeParent: null,
      nextCommitNumber: 3,
      terminal: ["Repository loaded. The newest release is broken."],
    };
  }

  if (missionSlug === "resolve-merge-conflict") {
    const base = {
      "README.md": BASE_README,
      "app.js": 'const greeting = "Hello";\nconsole.log(greeting);\n',
    };
    const mainSnapshot = {
      ...base,
      "app.js": 'const greeting = "Hello from main";\nconsole.log(greeting);\n',
    };
    const featureSnapshot = {
      ...base,
      "app.js": 'const greeting = "Hello from feature";\nconsole.log(greeting);\n',
    };
    const c1 = createCommit("c1a0f3", "Initial project", [], base, 1);
    const c2 = createCommit(
      "c2b8e1",
      "Update greeting on main",
      [c1.id],
      mainSnapshot,
      2,
    );
    const c3 = createCommit(
      "c3d4a2",
      "Build feature greeting",
      [c1.id],
      featureSnapshot,
      3,
    );

    return {
      missionSlug,
      commits: { [c1.id]: c1, [c2.id]: c2, [c3.id]: c3 },
      branches: { main: c2.id, feature: c3.id },
      currentBranch: "main",
      workingFiles: cloneSnapshot(mainSnapshot),
      stagedFiles: [],
      conflictFiles: [],
      mergeParent: null,
      nextCommitNumber: 4,
      terminal: ["Repository loaded. main and feature have diverged."],
    };
  }

  const initial = {
    "README.md": BASE_README,
    "app.js": BASE_APP,
  };
  const c1 = createCommit("c1a0f3", "Initial commit", [], initial, 1);

  return {
    missionSlug,
    commits: { [c1.id]: c1 },
    branches: { main: c1.id },
    currentBranch: "main",
    workingFiles: cloneSnapshot(initial),
    stagedFiles: [],
    conflictFiles: [],
    mergeParent: null,
    nextCommitNumber: 2,
    terminal: ["Initialized empty training repository."],
  };
}

function getHeadId(state: GitSandboxState) {
  return state.branches[state.currentBranch];
}

function getHead(state: GitSandboxState) {
  return state.commits[getHeadId(state)];
}

function changedFiles(state: GitSandboxState) {
  const head = getHead(state);
  const names = new Set([
    ...Object.keys(head.snapshot),
    ...Object.keys(state.workingFiles),
  ]);

  return [...names].filter(
    (name) => (head.snapshot[name] ?? "") !== (state.workingFiles[name] ?? ""),
  );
}

function isDirty(state: GitSandboxState) {
  return changedFiles(state).length > 0 || state.stagedFiles.length > 0;
}

function appendTerminal(
  state: GitSandboxState,
  command: string,
  output: string,
) {
  return {
    ...state,
    terminal: [...state.terminal, `$ ${command}`, output].slice(-80),
  };
}

function makeCommitId(number: number) {
  return `c${number.toString(16)}${(number * 7919)
    .toString(16)
    .slice(-4)
    .padStart(4, "0")}`;
}

function ancestors(state: GitSandboxState, startId: string) {
  const seen = new Set<string>();
  const queue = [startId];

  while (queue.length > 0) {
    const id = queue.shift();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    queue.push(...(state.commits[id]?.parents ?? []));
  }

  return seen;
}

function findCommonAncestor(
  state: GitSandboxState,
  firstId: string,
  secondId: string,
) {
  const firstAncestors = ancestors(state, firstId);
  const queue = [secondId];
  const seen = new Set<string>();

  while (queue.length > 0) {
    const id = queue.shift();
    if (!id || seen.has(id)) continue;
    if (firstAncestors.has(id)) return id;
    seen.add(id);
    queue.push(...(state.commits[id]?.parents ?? []));
  }

  return null;
}

function statusOutput(state: GitSandboxState) {
  const changed = changedFiles(state).filter(
    (name) => !state.stagedFiles.includes(name),
  );

  if (
    changed.length === 0 &&
    state.stagedFiles.length === 0 &&
    state.conflictFiles.length === 0
  ) {
    return `On branch ${state.currentBranch}\nnothing to commit, working tree clean`;
  }

  const sections = [`On branch ${state.currentBranch}`];

  if (state.conflictFiles.length > 0) {
    sections.push(
      `Unmerged paths:\n${state.conflictFiles.map((file) => `  both modified: ${file}`).join("\n")}`,
    );
  }

  if (state.stagedFiles.length > 0) {
    sections.push(
      `Changes to be committed:\n${state.stagedFiles.map((file) => `  modified: ${file}`).join("\n")}`,
    );
  }

  if (changed.length > 0) {
    sections.push(
      `Changes not staged for commit:\n${changed.map((file) => `  modified: ${file}`).join("\n")}`,
    );
  }

  return sections.join("\n\n");
}

function logOutput(state: GitSandboxState) {
  const branchLabels = new Map<string, string[]>();

  for (const [branch, id] of Object.entries(state.branches)) {
    branchLabels.set(id, [...(branchLabels.get(id) ?? []), branch]);
  }

  return Object.values(state.commits)
    .sort((a, b) => b.order - a.order)
    .map((commit) => {
      const labels = branchLabels.get(commit.id);
      const marker = labels?.length ? ` (${labels.join(", ")})` : "";
      return `* ${commit.id}${marker} ${commit.message}`;
    })
    .join("\n");
}

function mergeSnapshots(
  base: Record<string, string>,
  ours: Record<string, string>,
  theirs: Record<string, string>,
) {
  const files = new Set([
    ...Object.keys(base),
    ...Object.keys(ours),
    ...Object.keys(theirs),
  ]);
  const snapshot: Record<string, string> = {};
  const conflicts: string[] = [];

  for (const file of files) {
    const baseValue = base[file] ?? "";
    const ourValue = ours[file] ?? "";
    const theirValue = theirs[file] ?? "";

    if (ourValue === theirValue) {
      snapshot[file] = ourValue;
    } else if (ourValue === baseValue) {
      snapshot[file] = theirValue;
    } else if (theirValue === baseValue) {
      snapshot[file] = ourValue;
    } else {
      snapshot[file] = `<<<<<<< HEAD\n${ourValue.trimEnd()}\n=======\n${theirValue.trimEnd()}\n>>>>>>> feature\n`;
      conflicts.push(file);
    }
  }

  return { snapshot, conflicts };
}

export function updateGitWorkingFile(
  state: GitSandboxState,
  filename: string,
  content: string,
): GitSandboxState {
  return {
    ...state,
    workingFiles: {
      ...state.workingFiles,
      [filename]: content,
    },
  };
}

export function runGitCommand(
  currentState: GitSandboxState,
  rawCommand: string,
): GitCommandResult {
  const command = rawCommand.trim().replace(/\s+/g, " ");
  let state = currentState;
  let output = "";

  if (!command) {
    return { state, output: "Enter a Git command." };
  }

  if (command === "git status") {
    output = statusOutput(state);
  } else if (command === "git log" || command.startsWith("git log ")) {
    output = logOutput(state);
  } else if (command === "git branch") {
    output = Object.keys(state.branches)
      .sort()
      .map((branch) => `${branch === state.currentBranch ? "*" : " "} ${branch}`)
      .join("\n");
  } else if (command.startsWith("git branch ")) {
    const branch = command.slice("git branch ".length).trim();

    if (!/^[A-Za-z0-9._/-]+$/.test(branch)) {
      output = "fatal: invalid branch name";
    } else if (state.branches[branch]) {
      output = `fatal: a branch named '${branch}' already exists`;
    } else {
      state = {
        ...state,
        branches: { ...state.branches, [branch]: getHeadId(state) },
      };
      output = `Created branch ${branch}`;
    }
  } else if (
    command.startsWith("git switch ") ||
    command.startsWith("git checkout ")
  ) {
    const usesSwitch = command.startsWith("git switch ");
    const tail = command.slice(usesSwitch ? 11 : 13).trim();
    const createMatch = tail.match(/^-c\s+(.+)$/);
    const branch = (createMatch?.[1] ?? tail).trim();

    if (isDirty(state)) {
      output = "error: commit or discard your changes before switching branches";
    } else if (!/^[A-Za-z0-9._/-]+$/.test(branch)) {
      output = "fatal: invalid branch name";
    } else if (createMatch && state.branches[branch]) {
      output = `fatal: a branch named '${branch}' already exists`;
    } else if (!createMatch && !state.branches[branch]) {
      output = `fatal: invalid reference '${branch}'`;
    } else {
      const branches = createMatch
        ? { ...state.branches, [branch]: getHeadId(state) }
        : state.branches;
      const targetId = branches[branch];
      state = {
        ...state,
        branches,
        currentBranch: branch,
        workingFiles: cloneSnapshot(state.commits[targetId].snapshot),
      };
      output = `Switched to branch '${branch}'`;
    }
  } else if (command === "git add" || command.startsWith("git add ")) {
    const target = command.slice("git add".length).trim();
    const changed = changedFiles(state);
    const requested = target === "." ? changed : [target];
    const missing = requested.filter((file) => !(file in state.workingFiles));
    const unresolved = requested.filter((file) =>
      /^(<<<<<<<|=======|>>>>>>>)/m.test(state.workingFiles[file] ?? ""),
    );

    if (!target) {
      output = "Nothing specified, nothing added.";
    } else if (missing.length > 0) {
      output = `fatal: pathspec '${missing[0]}' did not match any files`;
    } else if (unresolved.length > 0) {
      output = `error: ${unresolved[0]} still contains conflict markers`;
    } else {
      const filesToStage = requested.filter((file) => changed.includes(file));
      const stagedFiles = [...new Set([...state.stagedFiles, ...filesToStage])];
      const conflictFiles = state.conflictFiles.filter(
        (file) => !requested.includes(file),
      );
      state = { ...state, stagedFiles, conflictFiles };
      output = filesToStage.length > 0 ? `Staged ${filesToStage.join(", ")}` : "Nothing to stage.";
    }
  } else if (command.startsWith("git commit")) {
    const match = command.match(
      /^git commit -m (?:(?:"([^"]+)")|(?:'([^']+)')|(.+))$/,
    );
    const message = (match?.[1] ?? match?.[2] ?? match?.[3] ?? "").trim();

    if (!message) {
      output = 'error: use git commit -m "your message"';
    } else if (state.conflictFiles.length > 0) {
      output = "error: resolve and stage every conflict before committing";
    } else if (state.stagedFiles.length === 0) {
      output = "nothing to commit, working tree clean";
    } else {
      const headId = getHeadId(state);
      const id = makeCommitId(state.nextCommitNumber);
      const parents = state.mergeParent
        ? [headId, state.mergeParent]
        : [headId];
      const commit = createCommit(
        id,
        message,
        parents,
        state.workingFiles,
        state.nextCommitNumber,
      );
      state = {
        ...state,
        commits: { ...state.commits, [id]: commit },
        branches: { ...state.branches, [state.currentBranch]: id },
        stagedFiles: [],
        conflictFiles: [],
        mergeParent: null,
        nextCommitNumber: state.nextCommitNumber + 1,
      };
      output = `[${state.currentBranch} ${id}] ${message}`;
    }
  } else if (command.startsWith("git merge ")) {
    const branch = command.slice("git merge ".length).trim();
    const targetId = state.branches[branch];
    const headId = getHeadId(state);

    if (!targetId) {
      output = `merge: ${branch} - not something we can merge`;
    } else if (branch === state.currentBranch) {
      output = "Already up to date.";
    } else if (isDirty(state)) {
      output = "error: commit or discard your changes before merging";
    } else if (ancestors(state, headId).has(targetId)) {
      output = "Already up to date.";
    } else if (ancestors(state, targetId).has(headId)) {
      state = {
        ...state,
        branches: { ...state.branches, [state.currentBranch]: targetId },
        workingFiles: cloneSnapshot(state.commits[targetId].snapshot),
      };
      output = `Fast-forwarded ${state.currentBranch} to ${branch}`;
    } else {
      const baseId = findCommonAncestor(state, headId, targetId);

      if (!baseId) {
        output = "fatal: refusing to merge unrelated histories";
      } else {
        const merged = mergeSnapshots(
          state.commits[baseId].snapshot,
          state.commits[headId].snapshot,
          state.commits[targetId].snapshot,
        );

        if (merged.conflicts.length > 0) {
          state = {
            ...state,
            workingFiles: merged.snapshot,
            conflictFiles: merged.conflicts,
            mergeParent: targetId,
          };
          output = `CONFLICT (content): Merge conflict in ${merged.conflicts.join(", ")}\nAutomatic merge failed; fix conflicts and commit the result.`;
        } else {
          const id = makeCommitId(state.nextCommitNumber);
          const commit = createCommit(
            id,
            `Merge branch '${branch}'`,
            [headId, targetId],
            merged.snapshot,
            state.nextCommitNumber,
          );
          state = {
            ...state,
            commits: { ...state.commits, [id]: commit },
            branches: { ...state.branches, [state.currentBranch]: id },
            workingFiles: merged.snapshot,
            nextCommitNumber: state.nextCommitNumber + 1,
          };
          output = `Merge made by the CodeQuest simulator.\n[${state.currentBranch} ${id}] Merge branch '${branch}'`;
        }
      }
    }
  } else if (command === "git revert HEAD") {
    if (isDirty(state)) {
      output = "error: commit or discard your changes before reverting";
    } else {
      const head = getHead(state);
      const parentId = head.parents[0];

      if (!parentId) {
        output = "error: cannot revert the root commit in this mission";
      } else {
        const id = makeCommitId(state.nextCommitNumber);
        const snapshot = cloneSnapshot(state.commits[parentId].snapshot);
        const commit = createCommit(
          id,
          `Revert \"${head.message}\"`,
          [head.id],
          snapshot,
          state.nextCommitNumber,
        );
        state = {
          ...state,
          commits: { ...state.commits, [id]: commit },
          branches: { ...state.branches, [state.currentBranch]: id },
          workingFiles: snapshot,
          nextCommitNumber: state.nextCommitNumber + 1,
        };
        output = `[${state.currentBranch} ${id}] ${commit.message}`;
      }
    }
  } else if (command === "git reset --hard") {
    state = {
      ...state,
      workingFiles: cloneSnapshot(getHead(state).snapshot),
      stagedFiles: [],
      conflictFiles: [],
      mergeParent: null,
    };
    output = `HEAD is now at ${getHeadId(state)} ${getHead(state).message}`;
  } else {
    output = `git: '${command.replace(/^git\s*/, "")}' is not available in this training sandbox`;
  }

  return {
    state: appendTerminal(state, command, output),
    output,
  };
}
