export interface CheatSheetEntry {
  id: string;
  title: string;
  description: string;
  code: string;
}

export interface CheatSheetSection {
  title: string;
  description: string;
  entries: CheatSheetEntry[];
}

export interface CheatSheet {
  slug: string;
  name: string;
  description: string;
  accent: string;
  playgroundLanguage: string;
  sections: CheatSheetSection[];
}

export const CHEAT_SHEETS: CheatSheet[] = [
  {
    slug: "html",
    name: "HTML",
    description: "Structure pages with semantic and accessible markup.",
    accent: "#FF8C42",
    playgroundLanguage: "html",
    sections: [
      {
        title: "Page structure",
        description: "The essential building blocks of a document.",
        entries: [
          {
            id: "html-document",
            title: "Document skeleton",
            description: "A minimal valid HTML5 page.",
            code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CodeQuest</title>
  </head>
  <body>
    <h1>Hello, adventurer!</h1>
  </body>
</html>`,
          },
          {
            id: "html-semantic-layout",
            title: "Semantic layout",
            description: "Meaningful landmarks for users and assistive tech.",
            code: `<header>Site header</header>
<nav aria-label="Main navigation">...</nav>
<main>
  <section>
    <h1>Quest log</h1>
  </section>
</main>
<footer>Site footer</footer>`,
          },
        ],
      },
      {
        title: "Forms & actions",
        description: "Collect input with labels and clear controls.",
        entries: [
          {
            id: "html-labeled-input",
            title: "Labeled input",
            description: "Connect labels and inputs with matching attributes.",
            code: `<label for="hero-name">Hero name</label>
<input
  id="hero-name"
  name="heroName"
  type="text"
  autocomplete="name"
  required
/>`,
          },
          {
            id: "html-button",
            title: "Button types",
            description: "Declare button intent explicitly inside forms.",
            code: `<form>
  <button type="submit">Save quest</button>
  <button type="reset">Reset</button>
  <button type="button">Open preview</button>
</form>`,
          },
        ],
      },
      {
        title: "Content patterns",
        description: "Common patterns for images, lists, and disclosure UI.",
        entries: [
          {
            id: "html-accessible-image",
            title: "Accessible image",
            description:
              "Use meaningful alt text, or empty alt for decoration.",
            code: `<img
  src="hero-avatar.png"
  alt="Pixel portrait of the current hero"
  width="160"
  height="160"
/>

<img src="sparkle.png" alt="" />`,
          },
          {
            id: "html-details",
            title: "Native disclosure",
            description: "Create expandable content without JavaScript.",
            code: `<details>
  <summary>Show quest hint</summary>
  <p>Check the loop condition before changing the counter.</p>
</details>`,
          },
        ],
      },
    ],
  },
  {
    slug: "css",
    name: "CSS",
    description: "Style responsive interfaces with modern layout tools.",
    accent: "#0FB5FF",
    playgroundLanguage: "html",
    sections: [
      {
        title: "Selectors & variables",
        description: "Target elements and keep design values reusable.",
        entries: [
          {
            id: "css-selectors",
            title: "Useful selectors",
            description: "Select by element, class, state, and relationship.",
            code: `button { cursor: pointer; }
.quest-card { border: 1px solid; }
.quest-card:hover { border-color: gold; }
.quest-card > h2 { margin-block: 0; }
input:focus-visible { outline: 2px solid gold; }`,
          },
          {
            id: "css-custom-properties",
            title: "Custom properties",
            description: "Define a small reusable color system.",
            code: `:root {
  --color-bg: #07080c;
  --color-panel: #10152a;
  --color-accent: #ffd400;
}

.panel {
  color: white;
  background: var(--color-panel);
}`,
          },
        ],
      },
      {
        title: "Layout",
        description: "Build one- and two-dimensional layouts.",
        entries: [
          {
            id: "css-flexbox",
            title: "Flexbox row",
            description: "Align items and distribute remaining space.",
            code: `.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}`,
          },
          {
            id: "css-grid",
            title: "Responsive grid",
            description: "Fit as many cards as the container allows.",
            code: `.quest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1.25rem;
}`,
          },
        ],
      },
      {
        title: "Responsive UI",
        description: "Adapt type and layout while respecting user settings.",
        entries: [
          {
            id: "css-fluid-type",
            title: "Fluid typography",
            description: "Scale text between safe minimum and maximum sizes.",
            code: `.hero-title {
  font-size: clamp(2.5rem, 8vw, 7rem);
  line-height: 0.9;
}`,
          },
          {
            id: "css-reduced-motion",
            title: "Reduced motion",
            description: "Disable non-essential animation when requested.",
            code: `@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}`,
          },
        ],
      },
    ],
  },
  {
    slug: "javascript",
    name: "JavaScript",
    description: "Work with values, collections, the DOM, and async code.",
    accent: "#FFD400",
    playgroundLanguage: "javascript",
    sections: [
      {
        title: "Values & functions",
        description: "Declare data and package reusable behavior.",
        entries: [
          {
            id: "js-variables",
            title: "Variables",
            description:
              "Prefer const; use let only when reassignment is needed.",
            code: `const heroName = "Nova";
let xp = 120;

xp += 30;
const reachedNextLevel = xp >= 150;`,
          },
          {
            id: "js-functions",
            title: "Function patterns",
            description: "Two common ways to declare a function.",
            code: `function calculateReward(baseXp, multiplier = 1) {
  return baseXp * multiplier;
}

const formatXp = (xp) => xp + " XP";`,
          },
        ],
      },
      {
        title: "Arrays & objects",
        description: "Transform collections without mutating source data.",
        entries: [
          {
            id: "js-array-methods",
            title: "Array methods",
            description: "Filter, transform, and combine values.",
            code: `const quests = [
  { title: "Loops", done: true, xp: 40 },
  { title: "Arrays", done: false, xp: 50 },
];

const completedTitles = quests
  .filter((quest) => quest.done)
  .map((quest) => quest.title);`,
          },
          {
            id: "js-spread",
            title: "Spread syntax",
            description: "Create updated copies of arrays and objects.",
            code: `const hero = { name: "Nova", level: 3 };
const leveledHero = { ...hero, level: hero.level + 1 };

const inventory = ["Potion"];
const expandedInventory = [...inventory, "Key"];`,
          },
        ],
      },
      {
        title: "Async & DOM",
        description: "Load data and interact with page elements.",
        entries: [
          {
            id: "js-fetch",
            title: "Fetch JSON",
            description: "Handle HTTP failures before reading the response.",
            code: `async function loadQuests() {
  const response = await fetch("/api/quests");

  if (!response.ok) {
    throw new Error("Could not load quests");
  }

  return response.json();
}`,
          },
          {
            id: "js-dom-event",
            title: "DOM event",
            description: "Find an element and react to user input.",
            code: `const runButton = document.querySelector("#run-code");

runButton?.addEventListener("click", () => {
  console.log("Quest started");
});`,
          },
        ],
      },
    ],
  },
  {
    slug: "react",
    name: "React",
    description: "Create reusable components with state, effects, and events.",
    accent: "#62E6FF",
    playgroundLanguage: "react",
    sections: [
      {
        title: "Components & props",
        description: "Split interfaces into small reusable pieces.",
        entries: [
          {
            id: "react-component",
            title: "Typed component",
            description: "Receive read-only data through props.",
            code: `interface QuestCardProps {
  title: string;
  xp: number;
}

export function QuestCard({ title, xp }: QuestCardProps) {
  return <article>{title} · {xp} XP</article>;
}`,
          },
          {
            id: "react-list",
            title: "Render a list",
            description: "Use a stable key for every rendered item.",
            code: `{quests.map((quest) => (
  <QuestCard
    key={quest.id}
    title={quest.title}
    xp={quest.xp}
  />
))}`,
          },
        ],
      },
      {
        title: "State & events",
        description: "Keep interactive values in component state.",
        entries: [
          {
            id: "react-state",
            title: "useState",
            description: "Update state from its previous value.",
            code: `const [xp, setXp] = useState(0);

const earnXp = () => {
  setXp((currentXp) => currentXp + 25);
};`,
          },
          {
            id: "react-controlled-input",
            title: "Controlled input",
            description: "Keep form input synchronized with React state.",
            code: `const [query, setQuery] = useState("");

<input
  value={query}
  onChange={(event) => setQuery(event.target.value)}
/>`,
          },
        ],
      },
      {
        title: "Effects & derived data",
        description: "Synchronize with external systems and calculate views.",
        entries: [
          {
            id: "react-effect",
            title: "Effect cleanup",
            description: "Subscribe once and clean up on unmount.",
            code: `useEffect(() => {
  const handleOnline = () => console.log("Online");
  window.addEventListener("online", handleOnline);

  return () => window.removeEventListener("online", handleOnline);
}, []);`,
          },
          {
            id: "react-derived-data",
            title: "Derived data",
            description: "Calculate filtered output instead of storing a copy.",
            code: `const visibleQuests = quests.filter((quest) =>
  quest.title.toLowerCase().includes(query.toLowerCase()),
);`,
          },
        ],
      },
    ],
  },
  {
    slug: "python",
    name: "Python",
    description:
      "Write clear scripts with collections, control flow, and functions.",
    accent: "#6FFFA2",
    playgroundLanguage: "python",
    sections: [
      {
        title: "Basics",
        description: "Store values, read input, and format output.",
        entries: [
          {
            id: "python-io",
            title: "Input and output",
            description: "Read text, convert numbers, and print a result.",
            code: `name = input("Hero name: ")
level = int(input("Level: "))

print(f"{name} reached level {level}!")`,
          },
          {
            id: "python-condition",
            title: "Condition",
            description: "Choose a path with if, elif, and else.",
            code: `if xp >= 100:
    rank = "Gold"
elif xp >= 50:
    rank = "Silver"
else:
    rank = "Bronze"`,
          },
        ],
      },
      {
        title: "Collections",
        description: "Store and transform groups of values.",
        entries: [
          {
            id: "python-list-comprehension",
            title: "List comprehension",
            description: "Filter and transform a list in one expression.",
            code: `rewards = [20, 45, 10, 60]
large_rewards = [xp for xp in rewards if xp >= 40]`,
          },
          {
            id: "python-dictionary",
            title: "Dictionary",
            description: "Store named values and access them by key.",
            code: `hero = {
    "name": "Nova",
    "level": 4,
    "online": True,
}

hero["level"] += 1`,
          },
        ],
      },
      {
        title: "Functions & errors",
        description: "Reuse logic and handle expected failures.",
        entries: [
          {
            id: "python-function",
            title: "Typed function",
            description: "Document parameter and return types.",
            code: `def calculate_reward(base_xp: int, multiplier: float = 1.0) -> int:
    return round(base_xp * multiplier)`,
          },
          {
            id: "python-exception",
            title: "Exception handling",
            description: "Catch only the error you expect.",
            code: `try:
    level = int(input("Level: "))
except ValueError:
    print("Enter a whole number.")
else:
    print(f"Level {level} accepted.")`,
          },
        ],
      },
    ],
  },
  {
    slug: "csharp",
    name: "C#",
    description: "Build typed .NET console programs and reusable classes.",
    accent: "#B28CFF",
    playgroundLanguage: "csharp",
    sections: [
      {
        title: "Console & types",
        description: "Read input and work with strongly typed values.",
        entries: [
          {
            id: "csharp-io",
            title: "Console input",
            description: "Read a line and safely parse a number.",
            code: `Console.Write("Level: ");
string? input = Console.ReadLine();

if (int.TryParse(input, out int level))
{
    Console.WriteLine($"Level {level} accepted.");
}`,
          },
          {
            id: "csharp-variables",
            title: "Variables and constants",
            description: "Use explicit types, var, and const intentionally.",
            code: `string heroName = "Nova";
var level = 4;
const int MaxLevel = 100;
bool canLevelUp = level < MaxLevel;`,
          },
        ],
      },
      {
        title: "Collections & LINQ",
        description: "Store, filter, and order data.",
        entries: [
          {
            id: "csharp-list",
            title: "Generic list",
            description: "Create and update a resizable collection.",
            code: `var quests = new List<string> { "Loops", "Arrays" };
quests.Add("Classes");
quests.Remove("Loops");

foreach (string quest in quests)
{
    Console.WriteLine(quest);
}`,
          },
          {
            id: "csharp-linq",
            title: "LINQ pipeline",
            description: "Filter and order without changing the source list.",
            code: `var visibleRewards = rewards
    .Where(reward => reward >= 40)
    .OrderByDescending(reward => reward)
    .ToList();`,
          },
        ],
      },
      {
        title: "Methods & classes",
        description: "Package behavior and protect object state.",
        entries: [
          {
            id: "csharp-method",
            title: "Method",
            description: "Accept parameters and return a typed result.",
            code: `static int CalculateReward(int baseXp, int multiplier = 1)
{
    return baseXp * multiplier;
}`,
          },
          {
            id: "csharp-class",
            title: "Small class",
            description: "Initialize state and expose controlled behavior.",
            code: `class Hero
{
    public string Name { get; }
    public int Level { get; private set; } = 1;

    public Hero(string name) => Name = name;
    public void LevelUp() => Level++;
}`,
          },
        ],
      },
    ],
  },
  {
    slug: "cpp",
    name: "C++",
    description: "Write portable C++17 with STL containers and safe ownership.",
    accent: "#899DFF",
    playgroundLanguage: "cpp",
    sections: [
      {
        title: "Console & types",
        description: "Build the entry point, read input, and print output.",
        entries: [
          {
            id: "cpp-program",
            title: "Console program",
            description: "A minimal portable C++17 program.",
            code: `#include <iostream>
#include <string>

int main() {
    std::string name;
    std::getline(std::cin, name);
    std::cout << "Hello, " << name << "!\\n";
    return 0;
}`,
          },
          {
            id: "cpp-variables",
            title: "Variables and const",
            description: "Use automatic type deduction and immutable values.",
            code: `const std::string heroName = "Nova";
int level = 4;
double health = 82.5;
const bool canLevelUp = level < 100;`,
          },
        ],
      },
      {
        title: "Containers & loops",
        description: "Store values and iterate safely.",
        entries: [
          {
            id: "cpp-vector",
            title: "std::vector",
            description: "Create, extend, and iterate through a dynamic array.",
            code: `#include <vector>

std::vector<int> rewards {20, 40, 60};
rewards.push_back(80);

for (const int reward : rewards) {
    std::cout << reward << '\\n';
}`,
          },
          {
            id: "cpp-algorithm",
            title: "STL algorithm",
            description: "Search a collection without writing a manual loop.",
            code: `#include <algorithm>

const auto found = std::find(
    quests.begin(),
    quests.end(),
    "Final Boss"
);

const bool exists = found != quests.end();`,
          },
        ],
      },
      {
        title: "Functions & ownership",
        description: "Pass data efficiently and manage resources safely.",
        entries: [
          {
            id: "cpp-const-reference",
            title: "const reference",
            description: "Avoid a copy while preventing modification.",
            code: `#include <string>

void printHero(const std::string& name) {
    std::cout << name << '\\n';
}`,
          },
          {
            id: "cpp-unique-ptr",
            title: "unique_ptr",
            description: "Give one owner automatic resource cleanup.",
            code: `#include <memory>

auto hero = std::make_unique<Hero>("Nova");
hero->levelUp();

// Memory is released automatically.`,
          },
        ],
      },
    ],
  },
];
