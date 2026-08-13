import type { ChapterSeed, ExerciseSeed } from "@/app/api/course-chapters/data";

const exercise = (
  name: string,
  slug: string,
  xp: number,
  difficulty: ExerciseSeed["difficulty"],
): ExerciseSeed => ({ name, slug, xp, difficulty });

export const CSHARP_DATA: ChapterSeed[] = [
  {
    id: 1,
    name: "C# & .NET Foundations",
    desc: "Understand the shape of a C# console program and write your first statements, comments, and output.",
    exercises: [
      exercise("Hello, CodeQuest!", "hello-codequest-csharp", 20, "easy"),
      exercise("Build the Program Entry Point", "build-the-program-entry-point", 25, "easy"),
      exercise("Statements and Semicolons", "statements-and-semicolons", 25, "easy"),
      exercise("Comment the Quest Plan", "comment-the-quest-plan", 25, "easy"),
      exercise("Read a Simple Program", "read-a-simple-program", 35, "medium"),
    ],
  },
  {
    id: 2,
    name: "Variables, Types & Console I/O",
    desc: "Store strongly typed values, read console input, convert text, and print useful program output.",
    exercises: [
      exercise("Store a Hero Name", "store-a-hero-name", 25, "easy"),
      exercise("Choose the Right Numeric Type", "choose-the-right-numeric-type", 30, "easy"),
      exercise("Read Console Input", "read-console-input", 30, "easy"),
      exercise("Convert the Player Level", "convert-the-player-level", 40, "medium"),
      exercise("Print a Character Sheet", "print-a-character-sheet-csharp", 45, "medium"),
    ],
  },
  {
    id: 3,
    name: "Operators & Conversions",
    desc: "Calculate results with arithmetic and assignment operators, compare values, and convert data safely.",
    exercises: [
      exercise("Damage Calculator", "damage-calculator-csharp", 30, "easy"),
      exercise("Update the XP Total", "update-the-xp-total", 30, "easy"),
      exercise("Compare Two Scores", "compare-two-scores", 35, "medium"),
      exercise("Safe Numeric Conversion", "safe-numeric-conversion", 45, "medium"),
      exercise("Gold Reward Formula", "gold-reward-formula", 50, "medium"),
    ],
  },
  {
    id: 4,
    name: "Strings & Text Processing",
    desc: "Create, format, inspect, normalize, and split text using C# strings and their built-in methods.",
    exercises: [
      exercise("Build a Status Message", "build-a-status-message", 25, "easy"),
      exercise("String Interpolation", "string-interpolation", 30, "easy"),
      exercise("Normalize the Player Name", "normalize-the-player-name", 40, "medium"),
      exercise("Inspect Quest Text", "inspect-quest-text", 45, "medium"),
      exercise("Split the Command", "split-the-command", 50, "medium"),
    ],
  },
  {
    id: 5,
    name: "Conditions & Pattern Matching",
    desc: "Choose program paths with comparisons, Boolean logic, if statements, switch expressions, and patterns.",
    exercises: [
      exercise("Level Gate", "level-gate-csharp", 30, "easy"),
      exercise("Potion Check", "potion-check-csharp", 35, "easy"),
      exercise("Rank Selector", "rank-selector", 40, "medium"),
      exercise("Switch the Character Class", "switch-the-character-class", 50, "medium"),
      exercise("Pattern Match the Reward", "pattern-match-the-reward", 60, "hard"),
    ],
  },
  {
    id: 6,
    name: "Loops",
    desc: "Repeat actions with for, foreach, while, break, and continue while keeping loop logic predictable.",
    exercises: [
      exercise("Repeat the Quest Message", "repeat-the-quest-message", 30, "easy"),
      exercise("Countdown to Battle", "countdown-to-battle-csharp", 35, "easy"),
      exercise("Sum XP Rewards", "sum-xp-rewards", 45, "medium"),
      exercise("Skip Locked Quests", "skip-locked-quests-csharp", 50, "medium"),
      exercise("Find the First Boss", "find-the-first-boss-csharp", 55, "hard"),
    ],
  },
  {
    id: 7,
    name: "Arrays & Lists",
    desc: "Store ordered values in arrays and generic lists, then add, remove, search, and iterate through them.",
    exercises: [
      exercise("Build an Inventory Array", "build-an-inventory-array", 30, "easy"),
      exercise("Read the Party Members", "read-the-party-members", 35, "easy"),
      exercise("Add Loot to a List", "add-loot-to-a-list", 40, "medium"),
      exercise("Remove a Completed Quest", "remove-a-completed-quest-csharp", 45, "medium"),
      exercise("Find the Highest Reward", "find-the-highest-reward", 55, "hard"),
    ],
  },
  {
    id: 8,
    name: "Methods, Parameters & Scope",
    desc: "Move logic into reusable methods with parameters, return values, optional arguments, overloads, and local scope.",
    exercises: [
      exercise("Create a Greeting Method", "create-a-greeting-method", 35, "easy"),
      exercise("Return a Damage Value", "return-a-damage-value", 40, "medium"),
      exercise("Optional Potion Amount", "optional-potion-amount", 45, "medium"),
      exercise("Method Overloading", "method-overloading", 50, "medium"),
      exercise("Refactor the Battle Logic", "refactor-the-battle-logic", 60, "hard"),
    ],
  },
  {
    id: 9,
    name: "Dictionaries, Sets & LINQ",
    desc: "Model keyed and unique data, then use beginner LINQ operations to filter, project, and order collections.",
    exercises: [
      exercise("Hero Stats Dictionary", "hero-stats-dictionary", 35, "easy"),
      exercise("Update the Player Score", "update-the-player-score", 40, "medium"),
      exercise("Unique Loot Set", "unique-loot-set", 45, "medium"),
      exercise("Filter Available Quests", "filter-available-quests-csharp", 50, "medium"),
      exercise("Sort the Leaderboard with LINQ", "sort-the-leaderboard-with-linq", 65, "hard"),
    ],
  },
  {
    id: 10,
    name: "Errors & Defensive Programs",
    desc: "Validate input, throw and catch expected exceptions, use finally, and protect program invariants.",
    exercises: [
      exercise("Validate Input with TryParse", "validate-input-with-tryparse", 40, "easy"),
      exercise("Throw an Invalid Level", "throw-an-invalid-level", 50, "medium"),
      exercise("Catch a Missing Key", "catch-a-missing-key", 50, "medium"),
      exercise("Always Close the Quest Log", "always-close-the-quest-log", 55, "medium"),
      exercise("Guard a Quest Record", "guard-a-quest-record", 65, "hard"),
    ],
  },
  {
    id: 11,
    name: "Classes & Objects",
    desc: "Create classes and instances, initialize state, add behavior, and protect data with encapsulation.",
    exercises: [
      exercise("Create a Hero Class", "create-a-hero-class-csharp", 40, "easy"),
      exercise("Initialize Hero Stats", "initialize-hero-stats", 45, "medium"),
      exercise("Add a LevelUp Method", "add-a-levelup-method", 50, "medium"),
      exercise("Encapsulate Health", "encapsulate-health", 55, "medium"),
      exercise("Build the Hero Summary", "build-the-hero-summary", 65, "hard"),
    ],
  },
  {
    id: 12,
    name: "Enums, Inheritance & Interfaces",
    desc: "Represent fixed choices and share behavior through base classes, overrides, and small interfaces.",
    exercises: [
      exercise("Define a Rank Enum", "define-a-rank-enum", 35, "easy"),
      exercise("Create a Mage Subclass", "create-a-mage-subclass", 45, "medium"),
      exercise("Override the Attack", "override-the-attack", 50, "medium"),
      exercise("Implement IDamageable", "implement-idamageable", 60, "hard"),
      exercise("Build a Party Hierarchy", "build-a-party-hierarchy", 70, "hard"),
    ],
  },
  {
    id: 13,
    name: "C# Final Project",
    desc: "Combine console input, collections, methods, validation, and classes in a complete quest-tracking application.",
    exercises: [
      exercise("Plan the Quest Tracker", "plan-the-csharp-quest-tracker", 40, "easy"),
      exercise("Create the Quest Model", "create-the-quest-model", 50, "medium"),
      exercise("Add Quest Commands", "add-quest-commands-csharp", 60, "medium"),
      exercise("Calculate Player Progress", "calculate-player-progress", 70, "hard"),
      exercise("Final Console Quest Tracker", "final-console-quest-tracker", 95, "hard"),
    ],
  },
];
