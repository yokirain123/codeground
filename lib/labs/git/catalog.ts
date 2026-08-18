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

const ukrainianMissionCopy: Record<
  string,
  Pick<GitSandboxMission, "title" | "description" | "objective" | "hint">
> = {
  "first-checkpoint": {
    title: "Перша контрольна точка",
    description: "Зміни README та збережи свою першу чисту контрольну точку.",
    objective: [
      "Відредагуй README.md у робочій області.",
      "Додай змінений файл до індексу.",
      "Створи коміт із власним повідомленням.",
    ],
    hint: "Спочатку відредагуй файл, потім виконай git add перед git commit.",
  },
  "feature-branch": {
    title: "Гілка функції",
    description: "Створи зміну поза main, а потім безпечно злий її.",
    objective: [
      "Створи гілку feature та перемкнися на неї.",
      "Відредагуй app.js, додай його до індексу й закоміть зміну.",
      "Повернися до main та злий гілку feature.",
    ],
    hint: "git switch -c feature одночасно створює гілку та перемикається на неї.",
  },
  "revert-broken-release": {
    title: "Скасуй зламаний реліз",
    description:
      "Останній коміт зламав production. Скасуй його, не видаляючи історію.",
    objective: [
      "Переглянь нещодавню історію комітів.",
      "Створи новий коміт, який скасовує HEAD.",
      "Збережи зламаний коміт видимим в історії.",
    ],
    hint: "Reset переписує стан. У цій місії потрібна команда, що створює новий коміт скасування.",
  },
  "resolve-merge-conflict": {
    title: "Конфлікт злиття",
    description:
      "Main і feature змінили той самий рядок. Розв’яжи конфлікт і заверши злиття.",
    objective: [
      "Злий наявну гілку feature в main.",
      "Відредагуй app.js і видали всі маркери конфлікту.",
      "Додай app.js до індексу та закоміть розв’язане злиття.",
    ],
    hint: "Після невдалого злиття відредагуй app.js, залиш потрібне фінальне привітання та видали <<<<<<<, ======= і >>>>>>>.",
  },
};

export function getGitSandboxMissions(locale: Locale = "en") {
  if (locale === "en") {
    return gitSandboxMissions;
  }

  return gitSandboxMissions.map((mission) => ({
    ...mission,
    ...ukrainianMissionCopy[mission.slug],
    objective: [
      ...(ukrainianMissionCopy[mission.slug]?.objective ?? mission.objective),
    ],
    suggestedCommands: [...mission.suggestedCommands],
  }));
}

export function getGitSandboxMission(slug: string, locale: Locale = "en") {
  return getGitSandboxMissions(locale).find((mission) => mission.slug === slug);
}
import type { Locale } from "@/lib/i18n/config";
