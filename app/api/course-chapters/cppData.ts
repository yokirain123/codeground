import type { ChapterSeed, ExerciseSeed } from "@/app/api/course-chapters/data";

const exercise = (
  name: string,
  slug: string,
  xp: number,
  difficulty: ExerciseSeed["difficulty"],
): ExerciseSeed => ({ name, slug, xp, difficulty });

export const CPP_DATA: ChapterSeed[] = [
  {
    id: 1,
    name: "C++ Program Foundations",
    desc: "Understand the structure of a C++17 console program and write your first includes, main function, statements, comments, and output.",
    exercises: [
      exercise("Hello, CodeQuest!", "hello-codequest-cpp", 20, "easy"),
      exercise(
        "Build the main Function",
        "build-the-main-function-cpp",
        25,
        "easy",
      ),
      exercise(
        "Include the I/O Library",
        "include-the-io-library-cpp",
        25,
        "easy",
      ),
      exercise(
        "Comment the Quest Plan",
        "comment-the-quest-plan-cpp",
        25,
        "easy",
      ),
      exercise(
        "Read a Simple C++ Program",
        "read-a-simple-program-cpp",
        35,
        "medium",
      ),
    ],
  },
  {
    id: 2,
    name: "Variables, Types & Console I/O",
    desc: "Store strongly typed values, protect constants, read console input, and print useful program output with streams.",
    exercises: [
      exercise("Store a Hero Name", "store-a-hero-name-cpp", 25, "easy"),
      exercise(
        "Choose the Right Numeric Type",
        "choose-the-right-numeric-type-cpp",
        30,
        "easy",
      ),
      exercise("Protect a Constant", "protect-a-constant-cpp", 30, "easy"),
      exercise("Read with cin", "read-with-cin-cpp", 35, "medium"),
      exercise(
        "Print a Character Sheet",
        "print-a-character-sheet-cpp",
        45,
        "medium",
      ),
    ],
  },
  {
    id: 3,
    name: "Operators & Conversions",
    desc: "Calculate results with arithmetic and assignment operators, compare values, and convert numeric types explicitly.",
    exercises: [
      exercise("Damage Calculator", "damage-calculator-cpp", 30, "easy"),
      exercise("Update the XP Total", "update-the-xp-total-cpp", 30, "easy"),
      exercise("Compare Two Scores", "compare-two-scores-cpp", 35, "medium"),
      exercise(
        "Average with static_cast",
        "average-with-static-cast-cpp",
        45,
        "medium",
      ),
      exercise("Gold Reward Formula", "gold-reward-formula-cpp", 50, "medium"),
    ],
  },
  {
    id: 4,
    name: "Strings & Text Processing",
    desc: "Create, combine, inspect, normalize, and parse text using std::string and beginner-friendly standard-library tools.",
    exercises: [
      exercise(
        "Build a Status Message",
        "build-a-status-message-cpp",
        25,
        "easy",
      ),
      exercise(
        "Measure the Quest Name",
        "measure-the-quest-name-cpp",
        30,
        "easy",
      ),
      exercise("Read a Full Line", "read-a-full-line-cpp", 35, "medium"),
      exercise(
        "Normalize the Player Name",
        "normalize-the-player-name-cpp",
        45,
        "medium",
      ),
      exercise(
        "Parse a Quest Command",
        "parse-a-quest-command-cpp",
        55,
        "hard",
      ),
    ],
  },
  {
    id: 5,
    name: "Conditions & Decisions",
    desc: "Choose program paths with comparisons, Boolean logic, if statements, switch, and conditional expressions.",
    exercises: [
      exercise("Level Gate", "level-gate-cpp", 30, "easy"),
      exercise("Potion Check", "potion-check-cpp", 35, "easy"),
      exercise("Rank Selector", "rank-selector-cpp", 40, "medium"),
      exercise(
        "Switch the Character Class",
        "switch-the-character-class-cpp",
        50,
        "medium",
      ),
      exercise("Choose a Reward", "choose-a-reward-cpp", 55, "hard"),
    ],
  },
  {
    id: 6,
    name: "Loops",
    desc: "Repeat actions with for, while, range-based loops, break, and continue while keeping control flow predictable.",
    exercises: [
      exercise(
        "Repeat the Quest Message",
        "repeat-the-quest-message-cpp",
        30,
        "easy",
      ),
      exercise("Countdown to Battle", "countdown-to-battle-cpp", 35, "easy"),
      exercise("Sum XP Rewards", "sum-xp-rewards-cpp", 45, "medium"),
      exercise("Skip Locked Quests", "skip-locked-quests-cpp", 50, "medium"),
      exercise("Find the First Boss", "find-the-first-boss-cpp", 55, "hard"),
    ],
  },
  {
    id: 7,
    name: "Arrays & Vectors",
    desc: "Store ordered values in std::array and std::vector, then add, remove, search, and iterate through them safely.",
    exercises: [
      exercise(
        "Build an Inventory Array",
        "build-an-inventory-array-cpp",
        30,
        "easy",
      ),
      exercise(
        "Read the Party Members",
        "read-the-party-members-cpp",
        35,
        "easy",
      ),
      exercise(
        "Add Loot to a Vector",
        "add-loot-to-a-vector-cpp",
        40,
        "medium",
      ),
      exercise(
        "Remove a Completed Quest",
        "remove-a-completed-quest-cpp",
        50,
        "medium",
      ),
      exercise(
        "Find the Highest Reward",
        "find-the-highest-reward-cpp",
        55,
        "hard",
      ),
    ],
  },
  {
    id: 8,
    name: "Functions, Parameters & Scope",
    desc: "Move logic into reusable functions with parameters, return values, default arguments, overloads, and clear local scope.",
    exercises: [
      exercise(
        "Create a Greeting Function",
        "create-a-greeting-function-cpp",
        35,
        "easy",
      ),
      exercise(
        "Return a Damage Value",
        "return-a-damage-value-cpp",
        40,
        "medium",
      ),
      exercise(
        "Pass Text by const Reference",
        "pass-text-by-const-reference-cpp",
        45,
        "medium",
      ),
      exercise(
        "Default Potion Amount",
        "default-potion-amount-cpp",
        50,
        "medium",
      ),
      exercise(
        "Refactor the Battle Logic",
        "refactor-the-battle-logic-cpp",
        60,
        "hard",
      ),
    ],
  },
  {
    id: 9,
    name: "References, Pointers & Const Safety",
    desc: "Understand aliases and addresses, update values safely, handle nullptr, and use const to make intent explicit.",
    exercises: [
      exercise(
        "Create a Score Reference",
        "create-a-score-reference-cpp",
        35,
        "easy",
      ),
      exercise(
        "Swap Stats by Reference",
        "swap-stats-by-reference-cpp",
        45,
        "medium",
      ),
      exercise(
        "Point to the Active Quest",
        "point-to-the-active-quest-cpp",
        45,
        "medium",
      ),
      exercise(
        "Guard Against nullptr",
        "guard-against-nullptr-cpp",
        55,
        "medium",
      ),
      exercise(
        "Make the API const-correct",
        "make-the-api-const-correct-cpp",
        65,
        "hard",
      ),
    ],
  },
  {
    id: 10,
    name: "Structs, Enums & STL Algorithms",
    desc: "Model game data with structs and enum class, then search, count, transform, and sort collections with the STL.",
    exercises: [
      exercise(
        "Create a Quest Struct",
        "create-a-quest-struct-cpp",
        35,
        "easy",
      ),
      exercise("Define a Rank Enum", "define-a-rank-enum-cpp", 40, "easy"),
      exercise(
        "Sort the Leaderboard",
        "sort-the-leaderboard-cpp",
        50,
        "medium",
      ),
      exercise(
        "Find an Available Quest",
        "find-an-available-quest-cpp",
        55,
        "medium",
      ),
      exercise(
        "Count Completed Quests",
        "count-completed-quests-cpp",
        65,
        "hard",
      ),
    ],
  },
  {
    id: 11,
    name: "Classes & Objects",
    desc: "Create classes and instances, initialize state, add behavior, protect data, and explore simple runtime polymorphism.",
    exercises: [
      exercise("Create a Hero Class", "create-a-hero-class-cpp", 40, "easy"),
      exercise(
        "Initialize Hero Stats",
        "initialize-hero-stats-cpp",
        45,
        "medium",
      ),
      exercise(
        "Add a levelUp Method",
        "add-a-levelup-method-cpp",
        50,
        "medium",
      ),
      exercise("Encapsulate Health", "encapsulate-health-cpp", 55, "medium"),
      exercise("Override the Attack", "override-the-attack-cpp", 70, "hard"),
    ],
  },
  {
    id: 12,
    name: "Errors, Files & RAII",
    desc: "Validate input, handle exceptions, read and write files, and let resource-owning objects clean up automatically.",
    exercises: [
      exercise(
        "Validate Numeric Input",
        "validate-numeric-input-cpp",
        40,
        "easy",
      ),
      exercise(
        "Throw an Invalid Level",
        "throw-an-invalid-level-cpp",
        50,
        "medium",
      ),
      exercise("Catch a Quest Error", "catch-a-quest-error-cpp", 50, "medium"),
      exercise("Write the Quest Log", "write-the-quest-log-cpp", 55, "medium"),
      exercise(
        "Own a Hero with unique_ptr",
        "own-a-hero-with-unique-ptr-cpp",
        70,
        "hard",
      ),
    ],
  },
  {
    id: 13,
    name: "C++ Final Project",
    desc: "Combine console input, vectors, functions, validation, algorithms, and classes in a complete quest-tracking application.",
    exercises: [
      exercise(
        "Plan the Quest Tracker",
        "plan-the-cpp-quest-tracker",
        40,
        "easy",
      ),
      exercise(
        "Create the Quest Model",
        "create-the-quest-model-cpp",
        50,
        "medium",
      ),
      exercise("Add Quest Commands", "add-quest-commands-cpp", 60, "medium"),
      exercise(
        "Calculate Player Progress",
        "calculate-player-progress-cpp",
        70,
        "hard",
      ),
      exercise(
        "Final Console Quest Tracker",
        "final-console-quest-tracker-cpp",
        95,
        "hard",
      ),
    ],
  },
];
